import { useEffect, useState } from "react";

export function useNarrowLayout() {
    const [narrow, setNarrow] = useState(
        () => window.matchMedia("(max-width: 760px)").matches,
    );

    useEffect(() => {
        const query = window.matchMedia("(max-width: 760px)");
        const update = () => setNarrow(query.matches);

        update();
        query.addEventListener("change", update);

        return () => query.removeEventListener("change", update);
    }, []);

    return narrow;
}