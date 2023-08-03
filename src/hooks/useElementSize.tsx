// hooks/useElementSize.tsx
import {
    DependencyList,
    MutableRefObject,
    useLayoutEffect,
    useRef,
    useState,
  } from "react";
  
  type Dimensions = {
    height: number;
    width: number;
  };
  
  // allow passing of dependencies to recompute height and width
  export const useElementSize = <T extends HTMLElement = HTMLDivElement>(
    deps: DependencyList
  ): [MutableRefObject<T | null>, Dimensions] => {
    const ref = useRef<T | null>(null);
    // Step 1. create a state to track the dimensions of the element
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
    // Step 2. use useUseLayoutEffect over useEffect so that we update the dimensions after the dom has finished updating
    useLayoutEffect(() => {
      if (ref.current) {
        const { clientWidth, clientHeight } = ref.current;
        setDimensions({
          width: clientWidth,
          height: clientHeight,
        });
      }
    }, deps);
  
    // Step 3. Return ref and dimensions
    return [ref, dimensions];
  };