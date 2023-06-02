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

interface Topic {
  name: string;
  slug: string;
  file: string;
  description: string;
}

const prisma = new PrismaClient();

async function parseQuestions(
  filePath: string,
  topicName: string,
  slug: string,
  description: string
) {
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
          description,
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
          description,
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
  const topicsFile = path.join(__dirname, "../data/topics/data-topics.json");

  try {
    const topicRawData = fs.readFileSync(topicsFile, "utf8");
    const topics = JSON.parse(topicRawData) as Topic[];

    topics.forEach(({ name, slug, file, description }) => {
      const filePath = path.join(__dirname, "../data/questions", file);
      void parseQuestions(filePath, name, slug, description);
    });
  } catch (err) {
    console.error(err);
  }
}

void parse();
