import {
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  Box,
  useToast,
  Flex,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Link,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AiOutlineUser } from "react-icons/ai";
import { doc, getFirestore, setDoc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { AiOutlineDownload } from "react-icons/ai";
import { loadStripe } from "@stripe/stripe-js";

const auth = getAuth();

const LoginFormItem = props => (
  <Box>
    <FormLabel >
      {props.title}
    </FormLabel>
    <Input
      placeholder={props.placeholder}
      value={props.obj[props.name]}
      onChange={props.onChange}
      name={props.name}
      type={props.name.includes("password") ? "password" : "text"}
    />
  </Box>
);

const Login = props => {
  const { setLogin, loginInfo } = props;
  return (
    <>
      <FormControl>
        <Flex flexDirection={"column"} gap={5}>
          <LoginFormItem
            placeholder="exemplo@email.com"
            name="email"
            title="Email"
            onChange={setLogin}
            obj={loginInfo}
          />
          <LoginFormItem
            placeholder="••••••••"
            name="password"
            title="Senha"
            onChange={setLogin}
            obj={loginInfo}
          />
        </Flex>
      </FormControl>
    </>
  );
};

const SignUp = props => {
  const { setSignUp, signUpInfo } = props;

  return (
    <FormControl>
      <Flex flexDirection={"column"} gap={2}>
        <LoginFormItem placeholder="Nome" name="name" title="Nome" onChange={setSignUp} obj={signUpInfo} />
        <LoginFormItem placeholder="Email" name="email" title="Email" onChange={setSignUp} obj={signUpInfo} />
        <LoginFormItem
          placeholder="••••••••"
          name="password"
          title="Senha"
          onChange={setSignUp}
          obj={signUpInfo}
        />
        <LoginFormItem
          placeholder="••••••••"
          name="password2"
          title="Confirme sua senha"
          onChange={setSignUp}
          obj={signUpInfo}
        />
      </Flex>
    </FormControl>
  );
};

export default props => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const emailReg = /^[a-z0-9.]+@[a-z0-9]+.[a-z]+.([a-z]+)?$/i;
  const toast = useToast();
  const [loginInfo, setLoginInfo] = useState({ email: "", password: "" });
  const [signUpInfo, setSignUpInfo] = useState({ name: "", email: "", password: "", password2: "" });
  const setSignUp = e => setSignUpInfo({ ...signUpInfo, [e.target.getAttribute("name")]: e.target.value });
  const setLogin = e => setLoginInfo({ ...loginInfo, [e.target.getAttribute("name")]: e.target.value });
  const [userHistory, setUserHistory] = useState([]);
  const [tabID, setTabID] = useState(0);
  const [logged, setLogged] = useState(false);

  useEffect(() => auth.onAuthStateChanged(user => setLogged(user ? true : false)), []);

  const toastError = value =>
    toast({
      title: "Preencha todos os campos corretamente",
      description: value,
      status: "error",
      isClosable: true,
    });

  useEffect(() => {
    const history = [];
    if (logged) {
      loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLICKEY).then(stripe => {
        getDoc(doc(getFirestore(), "users", auth.currentUser.uid)).then(response => {
          response
            .data()
            .history.map(id =>
              stripe.retrievePaymentIntent(id).then(result => history.push(result.paymentIntent))
            );
        });
      });
      setUserHistory(history);
    }
  }, [logged]);

  const sendSignUp = () => {
    const { email, password, password2, name } = signUpInfo;
    if (!Object.values(signUpInfo).every(x => x.length > 1)) return toastError("Preencha todos os campos");
    if (!emailReg.test(email)) return toastError("Email Inválido");
    if (password != password2) return toastError("As senhas não correspondem");
    createUserWithEmailAndPassword(auth, signUpInfo.email, signUpInfo.password)
      .then(userCredential => {
        setDoc(doc(getFirestore(), "users", userCredential.user.uid), { email, name, cart: [], history: [] });
        toast({
          title: "Parabéns",
          description: "Conta criada com sucesso",
          status: "success",
          isClosable: true,
        });
      })
      .catch(e => toastError(e.message));
  };

  const sendLogin = () => {
    const { email, password } = loginInfo;
    if (!Object.values(loginInfo).every(x => x.length > 1)) return toastError("Preencha todos os campos");
    if (!emailReg.test(email)) return toastError("Email Inválido");
    signInWithEmailAndPassword(auth, loginInfo.email, loginInfo.password).catch(e => toastError(e.message));
  };

  const UserHistoryItem = props => {
    const { item } = props;
    if (item.next_action) {
      return (
        <Flex bg={"#f1f1f1"} key={item.id} flexDirection={"column"} className="gap-2 p-5 rounded-md">
          <Box>
            <Text className="font-bold">ID da Transação:</Text>
            <Text>{item.id}</Text>
          </Box>
          <Link href={item.next_action.boleto_display_details.pdf} isExternal>
            <Flex className="pr-5 pl-4 py-1 border-2 border-[#d9d9d9] rounded-md font-bold text-md items-center w-min gap-3">
              <Text>Boleto</Text>
              <AiOutlineDownload className="text-xl" />
            </Flex>
          </Link>
          <Flex justifyContent={"space-between"}>
            <Text className=" text-red-800 font-bold ">Pendente</Text>
            <Text fontWeight={"bold"}>R$ {item.amount / 100}</Text>
          </Flex>
        </Flex>
      );
    }
    return (
      <Flex bg={"#f1f1f1"} key={item.id} flexDirection={"column"} className="gap-5 p-5 rounded-md">
        <Box>
          <Text className="font-bold">ID da Transação:</Text>
          <Text>{item.id}</Text>
        </Box>
        <Flex justifyContent={"space-between"}>
          <Text className=" text-green-600 font-bold ">Aprovado</Text>
          <Text fontWeight={"bold"}>R$ {item.amount / 100}</Text>
        </Flex>
      </Flex>
    );
  };

  return (
    <>
      <AiOutlineUser onClick={onOpen} className="cursor-pointer" />
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setTabID(0);
        }}
        scrollBehavior={"inside"}
      >
        <ModalOverlay />
        <ModalContent mx={2}>
          <ModalCloseButton />
          {logged ? (
            <>
              <ModalHeader>Usuário</ModalHeader>
              <ModalBody>
                <Flex flexDirection={"column"} gap={5}>
                  <Box>
                    <Text className="font-bold">Id do Usuário:</Text>
                    <Text>{auth.currentUser.uid}</Text>
                  </Box>
                  <Box>
                    <Text className="font-bold">Email:</Text>
                    <Text>{auth.currentUser.email}</Text>
                  </Box>
                </Flex>
                <Text className="font-bold text-xl mt-5">Histórico:</Text>
                <Flex gap={"10px"} className="flex-col mt-2">
                  {userHistory.map(item => (
                    <UserHistoryItem item={item} />
                  ))}
                </Flex>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="brand" onClick={() => auth.signOut()}>
                  Sair
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalHeader>Entrar</ModalHeader>
              <ModalBody>
                <Tabs onChange={setTabID} value={tabID}>
                  <TabList>
                    <Tab>Entrar</Tab>
                    <Tab>Cadastrar</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <Login loginInfo={loginInfo} setLogin={setLogin} />
                    </TabPanel>
                    <TabPanel>
                      <SignUp signUpInfo={signUpInfo} setSignUp={setSignUp} />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="brand" onClick={tabID == 0 ? sendLogin : sendSignUp}>
                  {tabID == 0 ? "Entrar" : "Cadastrar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
