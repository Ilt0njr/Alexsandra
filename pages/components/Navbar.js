import Cart from "./Cart";
import Login from "./Login";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

export default () => {
  const router = useRouter();
  const LinkToLinks = props => (
    <li>
      <motion.div>
        <Link href={props.link}>{props.title}</Link>
        {router.pathname == props.link && (
          <div className="h-[2px] w-full bg-primary rounded" />
        )}
      </motion.div>
    </li>
  );

  const Links = () => (
    <div>
      <ul className="flex gap-10  uppercase">
        <LinkToLinks title="Início" link="/" />
        <LinkToLinks title="Buscar" link="/search" />
      </ul>
    </div>
  );

  return (
    <div className="h-16 w-screen bg-white flex items-center justify-between">
      <div className="flex gap-20 items-center">
        <span className="text-3xl ml-10 font-bold text-primary">
          Nova Historia
        </span>
        <Links />
      </div>
      <div className="flex gap-10 text-2xl mr-10 ">
        <Login />
        <Cart />
      </div>
    </div>
  );
};
