import { User } from "../../payload-types";
import { BeforeChangeHook } from "payload/dist/collections/config/types";
import { Access, CollectionConfig } from "payload/types";
const addUser: BeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null;
  return { ...data, user: user?.id };
};
const yourOwnAndPurchased: Access = async ({ req }) => {
  const user = req.user as User | null;
  if (user?.role === "admin") {
    return true;
  }
  if (!user) {
    return false;
  }
  const { docs: products } = await req.payload.find({
    collection: "products",
    depth: 0,
    where: {
      user: {
        equals: user.id,
      },
    },
  });

  const ownProductsFilesId = products.map((prod) => prod.product_files).flat();
  const { docs: orders } = await req.payload.find({
    collection: "orders",
    depth: 2,
    where: {
      user: {
        equals: user.id,
      },
    },
  });

  const purchasedProductsFilesId = orders
    .map((order : any) => {
      return order.products.map((product : any) => {
        if (typeof product === "string") {
          return req.payload.logger.error(
            "search depth sufficient to find purchased file IDs"
          );
        }
        return typeof product.product_files === "string"
          ? product.product_files
          : product.product_files.id;
      });
    })
    .filter(Boolean)
    .flat();
  return {
    id: {
      in: [...ownProductsFilesId, ...purchasedProductsFilesId],
    },
  };
};
export const ProductFiles: CollectionConfig = {
  slug: "product_files",
  admin: {
    hidden: ({ user }) => user.role !== "admin",
  },
  hooks: {
    beforeChange: [addUser],
  },
  access: {
    read: yourOwnAndPurchased,
    update: ({ req }) => req.user.role === "admin",
    delete: ({ req }) => req.user.role === "admin",
  },
  upload: {
    staticURL: "/products_files",
    staticDir: "products_files",
    mimeTypes: ["image/*", "font/*", "application/postscript", "zip/*"],
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      admin: {
        condition: () => false,
      },
      hasMany: false,
      required: true,
    },
  ],
};
