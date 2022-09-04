import { useRouter } from "next/router";
import { useDebugValue, useEffect, useState } from "react";
import Card from "./components/Card";
import { MdOutlineSearch, MdOutlineFilterList, MdClear } from "react-icons/md";
import Navbar from "./components/Navbar";
import {
  InputGroup,
  Input,
  InputRightElement,
  useDisclosure,
} from "@chakra-ui/react";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from "@chakra-ui/react";
import { FiFilter } from "react-icons/fi";

const Filter = props => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [categorys, setCategorys] = useState([]);
  const router = useRouter();
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const URLtypes = router.query.types ? router.query.types : [];
    fetch("/api/products")
      .then(response => response.json())
      .then(result => {
        setCategorys(result.categorys);
      });
  }, []);

  useEffect(() => {
    const types = router.query.types ? router.query.types : [];
    setTypes(typeof types == "string" ? [types] : types);
  }, [router.query.types]);

  const queryTypes = () =>
    router.push(
      { pathname: "/search", query: { ...router.query, types } },
      undefined,
      {
        shallow: true,
      }
    );

  return (
    <>
      <FiFilter onClick={onOpen} className="text-3xl" />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Categorias</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CheckboxGroup defaultValue={types} onChange={setTypes}>
              {categorys.map(i => (
                <Checkbox value={i} key={i} isChecked={types.includes(i)}>
                  {i}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </ModalBody>
          <ModalFooter>
            <Button variant={"primary"} onClick={queryTypes}>
              Filtrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default () => {
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const router = useRouter();
  const { search } = router.query;
  const types = router.query.types
    ? typeof router.query.types == "string"
      ? [router.query.types]
      : router.query.types
    : [];

  const querySearch = event => {
    const search = event.target.value;
    router.push(
      { pathname: "/search", query: { ...router.query, search } },
      undefined,
      {
        shallow: true,
      }
    );
  };

  const removeType = item => {
    const removed = types.filter(i => i != item);
    router.push(
      { pathname: "/search", query: { ...router.query, types: removed } },
      undefined,
      {
        shallow: true,
      }
    );
  };

  useEffect(() => {
    fetch("api/products")
      .then(response => response.json())
      .then(setAllProducts);
  }, []);

  useEffect(() => {
    const productsByType = allProducts.productsByType;
    let query = allProducts.products ? allProducts.products : [];

    const getSearch = products =>
      products.filter(i =>
        Object.values(i.metadata)
          .map(j => j.toLowerCase().includes(search.toLowerCase()))
          .includes(true)
      );

    if (productsByType) {
      if (types.length > 0) {
        query = types.map(i => productsByType[i]).flat(2);
      } else if (search) {
        query = getSearch(query);
      }
      setProducts(query);
    }
  }, [router.query, allProducts]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center ">
        <div className=" px-10 flex justify-between items-center w-[100%] gap-5 md:gap-20 py-14 border-b-[1px] border-[#d9d9d9]">
          <InputGroup>
            <InputRightElement
              children={<MdOutlineSearch fontSize={"1.5rem"} />}
              h="full"
            />
            <Input
              placeholder="Buscar"
              size="lg"
              bg={"#E3E9F0"}
              _focus={{ bg: "white" }}
              focusBorderColor={"none"}
            />
          </InputGroup>

          <Filter types={types} />
        </div>
        <div className="flex gap-5">
          {types.map(i => (
            <div
              className="px-3 py-2 bg-white bg-opacity-90 text-lg flex gap-3 items-center"
              key={i}
            >
              <a>{i.toUpperCase()}S</a>
              <MdClear
                className="text-2xl cursor-pointer"
                onClick={() => removeType(i)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-20 w-full p-20 justify-center flex-wrap">
        {[1, 2, 3, 4, 5, 6, 7].map(() =>
          products.map(i => <Card product={i} key={i.id} />)
        )}
      </div>
    </>
  );
};
