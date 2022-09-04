import {
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
} from "@chakra-ui/react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import AdressForm from "./AdressForm";

export default props => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        onClick={onOpen}
        variant="primary"
        leftIcon={<AiOutlineShoppingCart className="text-2xl" />}
      >
        Finalizar Compra.
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />

        <ModalContent minWidth={"max-content"}>
          <ModalHeader>Endereço</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AdressForm prices={props.prices} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
