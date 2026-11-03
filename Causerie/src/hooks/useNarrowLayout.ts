import { useEffect, useState } from "react";

const NARROW_LAYOUT_QUERY = "(max-width: 1000px)";
export function useNarrowLayout() {
    const [narrow, setNarrow] = useState(
        () => window.matchMedia(NARROW_LAYOUT_QUERY).matches,
    );

    useEffect(() => {
        const query = window.matchMedia(NARROW_LAYOUT_QUERY);
        const update = () => setNarrow(query.matches);

        update();
        query.addEventListener("change", update);

        return () => query.removeEventListener("change", update);
    }, []);

    return narrow;
}