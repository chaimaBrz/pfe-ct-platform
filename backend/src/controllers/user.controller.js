import { prisma } from "../db/prisma.js";
import bcrypt from "bcrypt";

export async function createUser(req, res) {
  const { email, password, role } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password_hash: hash,
      role,
    },
  });

  res.json(user);
}

export async function getUsers(req, res) {
  const users = await prisma.user.findMany();
  res.json(users);
}
