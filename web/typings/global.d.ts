declare global {
  type AnyObject = Record<string, any>;

  type AnyArray = any[];

  type UnknownObject = Record<string, unknown>;
}

export default global;
