import { useEffect, useRef } from "react";

import { isSWRegistrationValid, SWManager } from "@arthurhovhannisyan31/simple-service-worker";

import { swEnabled } from "lib/constants";

export const useInitSW = (): void => {
  const swManagerRef = useRef<SWManager>(undefined);

  useEffect(() => {
    if (!isSWRegistrationValid() || swManagerRef.current) return;

    const init = async (): Promise<void> => {
      const swManager = await SWManager.init({
        enabled: swEnabled,
        postMessage: (action) => {
          console.log(action);
        },
      });

      if (swManager) {
        swManagerRef.current = swManager;
      }
    };

    init();
  }, []);
};
