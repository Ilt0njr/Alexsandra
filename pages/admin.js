import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { Button, Input, FormLabel, Box, Tag, Wrap, useToast } from "@chakra-ui/react";
import { data } from "autoprefixer";

const auth = getAuth();

const blankInfo = {
  name: "",
  price: "",
  description: "",
  type: "",
  state: "",
  chips: [],
  size: "",
};

const getId = () => {
  const date = new Date();
  return (
    "" +
    date.getDate() +
    date.getMonth() +
    date.getFullYear() +
    date.getHours() +
    date.getMinutes() +
    date.getSeconds()
  );
};

const LoginFormItem = props => (
  <Box>
    <FormLabel fontSize={"1.1rem"} fontWeight="semibold">
      {props.title}
    </FormLabel>
    <Input
      size="lg"
      placeholder={props.placeholder}
      value={props.obj[props.name]}
      onChange={props.onChange}
      name={props.name}
    />
  </Box>
);

export default () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [images, setImages] = useState([]);
  const [info, setInfo] = useState(blankInfo);
  const saveInfo = e => setInfo({ ...info, [e.target.getAttribute("name")]: e.target.value });
  const ImagesPreview = images.map(i => URL.createObjectURL(i));
  const toast = useToast();

  useEffect(() => {
    auth.onAuthStateChanged(user =>
      user
        ? setIsAdmin(auth.currentUser.uid == "BqLeifsO87hPtnw7WpQsHnq6FZs2" ? true : false)
        : setIsAdmin(false)
    );
  }, []);

  const chipKeyDown = e => {
    if (e.key == "Enter") {
      setInfo({ ...info, chips: [...info.chips, e.target.value.replace(" ", "-")] });
      e.target.value = "";
    }
  };

  const sendProduct = async () => {
    if (!Object.values(info).every(i => i.length > 0))
      return toast({
        title: "Produto não adicionado",
        description: "Preencha todos os campos corretamente",
        status: "error",
      });
    if (!images.length)
      return toast({
        title: "Produto não adicionado",
        description: "Cada produto deve conter pelo menos uma imagem",
        status: "error",
      });

    const id = getId();
    const urls = [];
    for (const i in images) {
      const reference = ref(getStorage(), `${id}/${i}.jpg`);
      const upload = await uploadBytes(reference, images[i]);
      const url = await getDownloadURL(reference);
      urls.push(url);
    }

    const response = await fetch("/api/addProduct", {
      method: "POST",
      body: JSON.stringify({ images: urls, info: { ...info } }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();

    if (result.success) {
      toast({
        title: "Sucesso!!!",
        description: "Produto adicionado com sucesso",
        status: "success",
      });
      setInfo(blankInfo);
      setImages([]);
    } else {
      toast({
        title: "Erro",
        description: result.error.message,
        status: "error",
      });
    }
  };

  if (!isAdmin) return;

  return (
    <div className="h-screen w-screen flex flex-col items-center">
      <Navbar />
      <div className="flex flex-col lg:flex-row gap-10 mt-20 mx-5">
        <div className="flex flex-col gap-10 justify-center items-center">
          <div className="overflow-x-scroll flex w-48 h-48 lg:w-96 lg:h-96">
            {ImagesPreview.map(i => (
              <img src={i} key={i} />
            ))}
          </div>
          <input type="file" onChange={e => setImages(Object.values(e.target.files))} multiple={true} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <LoginFormItem placeholder="Nome" name="name" title="Nome" onChange={saveInfo} obj={info} />
          <LoginFormItem placeholder="R$ " name="price" title="Valor" onChange={saveInfo} obj={info} />
          <LoginFormItem placeholder="Estado" name="state" title="Estado" onChange={saveInfo} obj={info} />
          <LoginFormItem
            placeholder="Categoria"
            name="type"
            title="Categoria"
            onChange={saveInfo}
            obj={info}
          />
          <LoginFormItem
            placeholder="Medidas"
            name="description"
            title="Medidas"
            onChange={saveInfo}
            obj={info}
          />
          <LoginFormItem placeholder="Tamanho" name="size" title="Tamanho" onChange={saveInfo} obj={info} />
          <Box>
            <FormLabel fontSize={"1.1rem"} fontWeight="semibold">
              Tags
            </FormLabel>
            <Input placeholder="Tags..." onKeyDown={chipKeyDown} obj={info.chips} />
          </Box>
          <span />

          <div className="flex flex-col gap-5 bg-[#f0f0f0] rounded p-5">
            <a className="text-xl font-bold">Tags:</a>
            <Wrap spacing={5} direction="row" className="w-80">
              {info.chips.map(i => (
                <Tag colorScheme="brand" variant="subtle" borderRadius="full" size="lg" key={i}>
                  {i.toUpperCase()}
                </Tag>
              ))}
            </Wrap>
          </div>
          <Button variant="primary" onClick={sendProduct}>
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
};
