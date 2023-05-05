import { PrismaClient } from "@prisma/client";

import fs from "fs";
import path from "path";

const filePath = path.join(__dirname, "data.json");

interface Question {
  content: string;
  options: string[];
  answer: number;
  details: string;
}

const prisma = new PrismaClient();

async function parse() {
  const rawData = fs.readFileSync(filePath, "utf8");
  try {
    const data = JSON.parse(rawData) as Question[];

    await prisma.question.createMany({
      data,
    });

    const questions = await prisma.question.findMany();

    console.log(questions);
  } catch (err) {
    console.error(err);
  }
}

void parse();
