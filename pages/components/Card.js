import Link from "next/link";

export default props => {
  const { product } = props;

  return (
    <Link href={product.id}>
      <div className="bg-white flex flex-col text-lg justify-between shadow-lg cursor-pointer">
        <img src={product.images[0]} className="w-72 h-80 object-cover rounded-md hover:brightness-90" />
        <div className="flex flex-col p-5">
          <span>{product.name}</span>
          <span className="text-end font-semibold font-sans text-xl">R$ {product.metadata.price}</span>
        </div>
      </div>
    </Link>
  );
};
