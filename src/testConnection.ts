import { connectDB } from "./config/database";
import { RoleModel } from "./models/Role";

const main = async () => {
  await connectDB();

  const roles = await RoleModel.find({});
  console.log("📄 Roles encontrados en la BD:");
  console.log(roles);

  process.exit(0); // Termina el proceso después de mostrar los datos
};

main();
