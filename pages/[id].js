import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { Tag, Wrap, useToast, Button } from "@chakra-ui/react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { getAuth } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar";
import Stripe from "stripe";

const auth = getAuth();

export default ({ product }) => {
  const [isLoged, setIsLoged] = useState(false);
  const imagesRef = useRef(null);
  const toast = useToast();

  const toastError = value =>
    toast({
      title: "Erro ao adicionar o produto ao carrinho",
      description: value,
      status: "error",
      isClosable: true,
    });

  useEffect(() => {
    auth.onAuthStateChanged(user => {
      if (user) setIsLoged(true);
      else setIsLoged(false);
    });
  }, []);

  const addToCart = () => {
    if (!auth.currentUser) return toastError("Entre em uma conta");
    updateDoc(doc(getFirestore(), "users", auth.currentUser.uid), { cart: arrayUnion(product.id) });
  };

  const scrollTo = e => {
    imagesRef.current.scrollLeft =
      (imagesRef.current.scrollWidth / 3) * parseInt(e.target.getAttribute("name"));
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center">
        <div className="mt-20 flex flex-col lg:flex-row justify-between items-center lg:w-[80vw]">
          <div className="flex lg:flex-row gap-2 justify-center items-center">
            <div className="hidden lg:flex lg:flex-col p-4 gap-3  h-min rounded">
              {product.images.map((image, i) => (
                <div className="border-2 border-[#aaa] p-3 rounded-md" key={image + "thumb"}>
                  <img
                    src={image}
                    className="h-[15vw] lg:h-[5vw] cursor-pointer "
                    name={i}
                    onClick={scrollTo}
                  />
                </div>
              ))}
            </div>
            <div ref={imagesRef} className="overflow-x-scroll flex w-[70vw] lg:w-[70vh] lg:overflow-x-hidden">
              {product.images.map(image => (
                <img src={image} className="h-[70vw] lg:h-[70vh]" key={image} />
              ))}
            </div>
          </div>
          <div className="flex flex-col text-base justify-between p-10 gap-7 lg:h-full">
            <a className="text-4xl font-thin">
              {product.name.toUpperCase()}
              <hr className="w-full mr-20 mt-5 text-gray-400 h-1" />
            </a>

            <Wrap spacing={5} wrap="wrap" direction="row">
              {product.metadata.chips.split(" ").map(text => (
                <Tag colorScheme="brand" variant="subtle" borderRadius="full" size="lg" key={text}>
                  {text.toUpperCase()}
                </Tag>
              ))}
            </Wrap>
            <a>Estado: {product.metadata.state}</a>
            <a className="aspect-square p-2 w-min flex justify-center bg-secondary text-white rounded">
              {product.metadata.size}
            </a>
            <a className="text-4xl font-bold">R$ {product.metadata.price}</a>
            <Button
              leftIcon={<AiOutlineShoppingCart className="text-2xl" />}
              variant="primary"
              onClick={addToCart}
            >
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </div>
      <div className="mx-10 my-20">
        <a className="text-lg">Descrição: {product.metadata.description}</a>
      </div>
    </>
  );
};

export const getStaticProps = async ({ params }) => {
  const stripe = new Stripe(process.env.STRIPE_PRIVATEKEY);
  const product = await stripe.products.retrieve(params.id);
  return {
    props: { product },
  };
};

export const getStaticPaths = async () => {
  const paths = [];
  const stripe = new Stripe(process.env.STRIPE_PRIVATEKEY);
  const response = await stripe.products.search({ query: "active:'true'" });

  response.data.forEach(item => paths.push({ params: { id: item.id } }));

  return {
    paths,
    fallback: false,
  };
};
