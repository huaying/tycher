import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

interface ActionsWithConfirmProps {
  onQuit: () => void;
  onSubmit: () => void;
}

const ConfirmInfoMap = {
  quit: {
    title: "確定離開",
    desc: "離開考試後成績不計，你還是可以觀看考試解答。",
    action: "離開",
  },
  submit: {
    title: "確定提交",
    desc: "確定提交後就不能再修改答案了，你可以在提交後觀看成績與詳解。",
    action: "提交",
  },
};

export default function ActionsWithConfirm(props: ActionsWithConfirmProps) {
  const { onQuit, onSubmit } = props;
  const [trigger, setTrigger] = useState<"quit" | "submit" | null>(null);
  const confirmInfo = trigger ? ConfirmInfoMap[trigger] : undefined;

  return (
    <AlertDialog open={!!trigger}>
      <AlertDialogTrigger asChild>
        <>
          <Button variant="secondary" onClick={() => setTrigger("quit")}>
            離開
          </Button>
          <Button onClick={() => setTrigger("submit")}>提交</Button>
        </>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmInfo?.title}</AlertDialogTitle>
          <AlertDialogDescription>{confirmInfo?.desc}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setTrigger(null)}>
            繼續作答
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              trigger && { quit: onQuit, submit: onSubmit }[trigger]();
              setTrigger(null);
            }}
          >
            {confirmInfo?.action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
