import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

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

async function parseFile(slug: string) {
  try {
    const topic = await prisma.topic.findFirst({
      where: { slug },
    });

    const questions = await prisma.question.findMany({
      where: {
        topicId: topic?.id,
      },
      select: {
        id: true,
        options: true,
        content: true,
        answer: true,
        details: true,
      },
    });

    await prisma.$transaction(
      questions.map((question) =>
        prisma.question.update({
          where: {
            id: question.id,
          },
          data: {
            uuid: crypto.randomUUID(),
          },
        })
      )
    );
  } catch (err) {
    console.log(err);
  }
}

function parse() {
  try {
    files.forEach(([_, __, slug]) => {
      void parseFile(slug);
    });
  } catch (err) {
    console.error(err);
  }
}

void parse();
