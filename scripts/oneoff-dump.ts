import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

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

async function parseFile(filename: string, slug: string) {
  try {
    const topic = await prisma.topic.findFirst({
      where: { slug },
    });

    const questions = await prisma.question.findMany({
      where: {
        topicId: topic?.id,
      },
      select: {
        options: true,
        content: true,
        answer: true,
        details: true,
        uuid: true,
      },
    });

    const filePath = path.join(__dirname, "../data", filename);

    fs.writeFile(
      filePath,
      JSON.stringify(questions, null, 2),
      "utf-8",
      (error) => {
        if (error) {
          console.log(error);
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
}

function parse() {
  try {
    files.forEach(([filename, __, slug]) => {
      void parseFile(filename, slug);
    });
  } catch (err) {
    console.error(err);
  }
}

void parse();
