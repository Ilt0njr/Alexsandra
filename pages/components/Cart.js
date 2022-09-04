import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Text,
  Image,
  Flex,
  Stack,
  StackDivider,
  Grid,
} from "@chakra-ui/react";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import {
  getDoc,
  doc,
  getFirestore,
  onSnapshot,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import PaymentForm from "./Payment/index";
import { MdClear, MdRemove, MdAdd } from "react-icons/md";

const auth = getAuth();

const CartItem = props => (
  <Flex className="p-2 gap-5 text-md h-min relative">
    <Image src={props.product.images[0]} boxSize={"80px"} />
    <Flex flexDirection={"column"} className="w-full justify-between">
      <Text className="leading-[1]">{props.product.name}</Text>
      <Flex className="gap-2 items-center justify-between">
        <Flex className="gap-2">
          <MdRemove
            className="border-black border-1 border h-7 w-7 justify-center items-center cursor-pointer"
            onClick={() => removeFromCart(props.product.id)}
          />
          <Text> 1 </Text>
          <MdAdd className="border-[#aaa] border-1 border h-7 w-7 justify-center items-center text-[#aaa] text-xs" />
        </Flex>
        <span className="text-lg mr-2">R$ {props.product.metadata.price}</span>
      </Flex>
    </Flex>
  </Flex>
);

const removeFromCart = id => {
  if (auth.currentUser) {
    updateDoc(doc(getFirestore(), "users", auth.currentUser.uid), {
      cart: arrayRemove(id),
    });
  }
};

export default () => {
  const [cartItems, setCartItems] = useState([]);
  const [logged, setLogged] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(
    () => auth.onAuthStateChanged(user => setLogged(user ? true : false)),
    []
  );

  const getCart = async () => {
    if (auth.currentUser) {
      const response = await fetch("/api/products");
      const result = await response.json();
      const products = result.products;
      const userResponse = await getDoc(
        doc(getFirestore(), "users", auth.currentUser.uid)
      );
      const cart = userResponse.data().cart;
      return products.filter(i => (cart.includes(i.id) ? true : false));
    }
  };

  useEffect(() => {
    if (logged) {
      getCart().then(setCartItems);
      onSnapshot(
        doc(getFirestore(), "users", auth.currentUser.uid),
        { includeMetadataChanges: true },
        doc => getCart().then(cart => (cart ? setCartItems(cart) : []))
      );
    }
  }, [logged]);

  return (
    <>
      <AiOutlineShoppingCart onClick={onOpen} className="cursor-pointer" />
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size={["xs", "sm"]}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader fontSize={"2rem"} textAlign={"center"}>
            Seu Carrinho
          </DrawerHeader>

          <DrawerBody>
            <Stack
              spacing={"25px"}
              divider={<StackDivider borderColor="gray.200" />}
            >
              {cartItems.map(i => (
                <CartItem key={i.id} product={i} />
              ))}
            </Stack>
          </DrawerBody>
          <DrawerFooter>
            <PaymentForm prices={cartItems.map(i => i.default_price)} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
