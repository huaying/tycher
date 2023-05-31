import { PrismaClient } from "@prisma/client";

import fs from "fs";
import path from "path";
interface Question {
  content: string;
  options: string[];
  answer: number;
  details: string;
  uuid: string;
}

const prisma = new PrismaClient();
const files = [
  ["data-accounting.json", "會計", "accounting"],
  ["data-chinese-medicine.json", "中醫", "chinese-medicine"],
  ["data-cs-easy.json", "計算機概論-簡單", "cs-easy"],
  ["data-cs-hard.json", "計算機概論-難", "cs-hard"],
  ["data-cs-medium.json", "計算機概論-中等", "cs-medium"],
  ["data-fengshui.json", "風水", "fengshui"],
  ["data-motocycle.json", "機車考照", "motocycle"],
  ["data-stock-tw.json", "台股", "stock-tw"],
  ["data-stock-us.json", "美股", "stock-us"],
  ["data-tarot.json", "塔羅牌", "tarot"],
  ["data-toefl.json", "托福", "toefl"],
  ["data-toeic.json", "多益", "toeic"],
  ["data-trivia.json", "冷知識", "trivia"],
  ["data-ui-ux.json", "UIUX", "uiux"],
] as const;

async function parseFile(filePath: string, topicName: string, slug: string) {
  const rawData = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(rawData) as Question[];
  try {
    const topic = await prisma.topic.findFirst({
      where: { slug },
    });

    if (topic) {
      await prisma.topic.update({
        where: { slug },
        data: {
          name: topicName,
          slug,
        },
      });
      await prisma.$transaction(
        data.map((question) =>
          prisma.question.update({
            where: {
              uuid: question.uuid,
            },
            data: {
              ...question,
            },
          })
        )
      );
    } else {
      const topic = await prisma.topic.create({
        data: {
          name: topicName,
          slug,
        },
      });
      await prisma.question.createMany({
        data: data.map((question) => ({
          ...question,
          topicId: topic.id,
        })),
      });
    }
  } catch (err) {
    console.log(err);
  }
}

function parse() {
  try {
    files.forEach(([filename, topic, slug]) => {
      const filePath = path.join(__dirname, "../data", filename);
      void parseFile(filePath, topic, slug);
    });
  } catch (err) {
    console.error(err);
  }
}

void parse();
