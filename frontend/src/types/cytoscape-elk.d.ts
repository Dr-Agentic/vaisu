declare module 'cytoscape-elk' {
  import cytoscape from 'cytoscape';

  const elk: (cy: typeof cytoscape) => void;
  export default elk;
}
