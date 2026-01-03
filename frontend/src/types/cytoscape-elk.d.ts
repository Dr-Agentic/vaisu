declare module 'cytoscape-elk' {
  import cytoscape from 'cytoscape';
  
  const elk: (cytoscape: typeof cytoscape) => void;
  export default elk;
}
