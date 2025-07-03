/**
 * Custom hook for modal auto-scroll functionality
 */

import { useRef, useCallback } from "react";
import { ModalRef } from "./Modal.types";

export const useModalAutoScroll = () => {
  const modalRef = useRef<ModalRef>(null);

  const scrollToEnd = useCallback((animated = true) => {
    setTimeout(() => {
      modalRef.current?.scrollToEnd(animated);
    }, 100);
  }, []);

  const scrollToEndDelayed = useCallback((animated = true, delay = 150) => {
    setTimeout(() => {
      modalRef.current?.scrollToEnd(animated);
    }, delay);
  }, []);

  const scrollTo = useCallback(
    (options: Parameters<ModalRef["scrollTo"]>[0]) => {
      modalRef.current?.scrollTo(options);
    },
    []
  );

  return {
    modalRef,
    scrollToEnd,
    scrollToEndDelayed,
    scrollTo,
  };
};
