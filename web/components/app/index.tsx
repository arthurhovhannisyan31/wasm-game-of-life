import { useMemo } from "react";

import { Layout } from "components/layout";
import { useInitSW } from "hooks/useInitSW";
import { useInitWasm } from "hooks/useInitWasm";

export const App = () => {
  useInitSW();

  const wasm = useInitWasm();
  const universe = useMemo(
    () => wasm?.Universe.new(),
    [wasm?.Universe]
  );

  console.log({
    wasm,
    universe
  });

  return (
    <Layout>
      Hello kitty
    </Layout>
  );
};
