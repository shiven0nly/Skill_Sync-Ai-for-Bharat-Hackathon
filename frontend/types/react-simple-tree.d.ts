declare module 'react-simple-tree' {
  import { ComponentType } from 'react';

  interface TreeProps {
    children?: React.ReactNode;
    [key: string]: any;
  }

  const Tree: ComponentType<TreeProps>;
  export default Tree;
}