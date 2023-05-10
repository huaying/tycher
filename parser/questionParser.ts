import { PrismaClient } from "@prisma/client";

import fs from "fs";
import path from "path";
interface Question {
  content: string;
  options: string[];
  answer: number;
  details: string;
}

const prisma = new PrismaClient();
const files = [
  ["data-accounting.json", "會計"],
  ["data-chinese-medicine.json", "中醫"],
  ["data-cs-easy.json", "計算機概論-簡單"],
  ["data-cs-hard.json", "計算機概論-難"],
  ["data-cs-medium.json", "計算機概論-中等"],
  ["data-fengshui.json", "風水"],
  ["data-motocycle.json", "機車考照"],
  ["data-stock-tw.json", "台股"],
  ["data-stock-us.json", "美股"],
  ["data-tarot.json", "塔羅牌"],
  ["data-toefl.json", "托福"],
  ["data-toeic.json", "多益"],
  ["data-trivia.json", "冷知識"],
  ["data-ui-ux.json", "UI/UX"],
] as const;

async function parseFile(filePath: string, topic: string) {
  const rawData = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(rawData) as Question[];
  try {
    const topicObj = await prisma.topic.upsert({
      where: { name: topic },
      update: {},
      create: {
        name: topic,
      },
    });
    await prisma.question.createMany({
      data: data.map((question) => ({
        ...question,
        topicId: topicObj.id,
      })),
    });
  } catch (err) {
    console.log(err);
  }
}

async function parse() {
  try {
    // const files = fs.readdirSync(path.join(__dirname, "data"));

    files.forEach(async ([filename, topic]) => {
      const filePath = path.join(__dirname, "data", filename);
      parseFile(filePath, topic);
    });
  } catch (err) {
    console.error(err);
  }
}

void parse();
