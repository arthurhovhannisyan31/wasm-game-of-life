import { Layout } from "components/layout";
import { useInitSW } from "hooks/useInitSW";

export const App = () => {
  useInitSW();

  return (
    <Layout>
      Hello kitty
    </Layout>
  );
};
