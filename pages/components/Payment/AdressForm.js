import {
  Button,
  Input,
  FormControl,
  FormLabel,
  Box,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

const getDeliveryOptions = async (CEP, N) => {
  const response = await fetch(
    "https://melhorenvio.com.br/api/v2/me/shipment/calculate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_MELHOR_ENVIO_TOKEN}`,
      },
      body: JSON.stringify({
        from: { postal_code: "88132530", number: "59" },
        to: { postal_code: CEP, number: N },
        package: { weight: 5, width: 10, height: 10, length: 17 },
      }),
    }
  );
  const result = await response.json();
  return result.filter(x => !x.error && x.company.name == "Correios");
};

export default props => {
  const [loading, setLoading] = useState(false);
  const [adress, setAdress] = useState({
    CEP: "",
    localidade: "",
    logradouro: "",
    bairro: "",
    uf: "",
    n: "",
    validCEP: false,
  });
  const save = e =>
    setAdress({ ...adress, [e.target.getAttribute("name")]: e.target.value });

  const toast = useToast();

  useEffect(() => {
    adress.CEP.length == 8
      ? fetch(`http://viacep.com.br/ws/${adress.CEP}/json/`)
          .then(response => response.json())
          .then(result => {
            const { localidade, logradouro, bairro, uf } = result;
            setAdress({
              ...adress,
              localidade,
              logradouro,
              bairro,
              uf,
              validCEP: true,
            });
          })
      : adress.validCEP != false
      ? setAdress({ ...adress, validCEP: false })
      : null;
  }, [adress.CEP]);

  const toastError = value =>
    toast({
      title: "Preencha todos os campos corretamente",
      description: value,
      status: "error",
    });

  const getSession = async () => {
    if (!adress.validCEP) return toastError("CEP Inválido");
    if (!Object.values(adress).every(i => i.length != 0)) return toastError();

    setLoading(true);
    const shippingOptions = await getDeliveryOptions(adress.CEP, adress.n);
    const response = await fetch("/api/payment", {
      method: "POST",
      body: JSON.stringify({
        prices: props.prices,
        shipping: shippingOptions[0],
      }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    window.location.assign(result.session.url);
    setLoading(false);
  };

  return (
    <FormControl className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-max mt-3">
      <Box>
        <FormLabel>CEP</FormLabel>
        <Input
          placeholder="CEP"
          name="CEP"
          onChange={save}
          value={adress.CEP}
          type="number"
        />
      </Box>
      <Box>
        <FormLabel>Estado</FormLabel>
        <Input placeholder="SC" name="uf" onChange={save} value={adress.uf} />
      </Box>
      <Box>
        <FormLabel>Cidade</FormLabel>
        <Input
          placeholder="Cidade"
          name="localidade"
          onChange={save}
          value={adress.localidade}
        />
      </Box>
      <Box>
        <FormLabel>Bairro</FormLabel>
        <Input
          placeholder="Bairro"
          name="bairro"
          onChange={save}
          value={adress.bairro}
        />
      </Box>
      <Box>
        <FormLabel>Rua</FormLabel>
        <Input
          placeholder="Rua."
          name="logradouro"
          onChange={save}
          value={adress.logradouro}
        />
      </Box>
      <Box>
        <FormLabel>Número</FormLabel>
        <Input
          placeholder="Nº"
          name="n"
          onChange={save}
          value={adress.n}
          type="number"
        />
      </Box>

      <Box className="mt-5 mb-2 w-full flex justify-between lg:col-span-2">
        {loading && (
          <Spinner
            thickness="4px"
            speed="0.65s"
            color="brand.500"
            size="lg"
            emptyColor="gray.200"
          />
        )}
        <Button colorScheme="brand" onClick={getSession}>
          Próximo
        </Button>
      </Box>
    </FormControl>
  );
};
