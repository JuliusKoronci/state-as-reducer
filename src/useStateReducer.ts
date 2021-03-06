import {Reducer, useCallback, useEffect, useMemo, useReducer} from "react";

type Action<T> =
    | {
    type: "REPLACE";
    payload: T;
}
    | {
    type: "RESET";
    payload: T;
}
    | {
    type: "LOADING";
}
    | {
    type: "FAILED";
    payload: unknown;
};

interface State<T> {
    data: T;
    loading: boolean;
    failed: boolean;
    error: unknown;
}

type NewStateProducer<T> =
    | T
    | ((currentState: T) => T)
    | ((currentState: T) => Promise<T>)
    | (() => Promise<T>);

type Producer<T> = () => Promise<T>;

const reducer = <T>(state: State<T>, action: Action<T>): State<T> => {
    if (action.type === "REPLACE") {
        return {
            data: action.payload,
            loading: false,
            failed: false,
            error: undefined,
        };
    }
    if (action.type === "RESET") {
        return {
            data: action.payload,
            loading: false,
            failed: false,
            error: undefined,
        };
    }
    if (action.type === "FAILED") {
        return {
            ...state,
            failed: true,
            loading: false,
            error: action.payload,
        };
    }
    if (action.type === "LOADING") {
        return {
            ...state,
            failed: false,
            error: undefined,
            loading: true,
        };
    }

    throw new Error("Unsupported");
};

const createInitialState = <T>(data?: T): State<T | undefined> => ({
    data,
    error: undefined,
    failed: false,
    loading: false,
});

export function useStateReducer<T>(initialState: T, producer?: Producer<T>): [
    T, (dataOrProducer: NewStateProducer<T>) => void,
        Pick<State<T>, "failed" | "loading" | "error"> & { reset: () => void }
]
export function useStateReducer<T>(initialState: undefined, producer?: Producer<T>): [
        undefined | T, (dataOrProducer: NewStateProducer<T>) => void,
        Pick<State<T>, "failed" | "loading" | "error"> & { reset: () => void }
]
export function useStateReducer<T>(): [
        undefined | T, (dataOrProducer: NewStateProducer<T>) => void,
        Pick<State<T>, "failed" | "loading" | "error"> & { reset: () => void }
]
export function useStateReducer<T>(
    initialState?: T,
    producer?: Producer<T>,
): [
        T | undefined,
    (dataOrProducer: NewStateProducer<T>) => void,
        Pick<State<T>, "failed" | "loading" | "error"> & { reset: () => void }
] {
    const [{
        data,
        error,
        failed,
        loading
    }, dispatch] = useReducer<Reducer<State<T | undefined>, Action<T | undefined>>>(reducer, createInitialState(initialState));

    const reset = useCallback(() => {
        dispatch({
            type: "RESET",
            payload: initialState,
        });
    }, [dispatch]);

    const updateStateAsync = async (getNewState?: Producer<T>) => {
        if (!getNewState) {
            return;
        }
        dispatch({
            type: "LOADING",
        });
        try {
            const newState = await getNewState();
            dispatch({
                type: "REPLACE",
                payload: newState,
            });
        } catch (error) {
            dispatch({
                type: "FAILED",
                payload: error,
            });
        }
    };

    const setState = useCallback((newStateOrStateProducer: NewStateProducer<T>): void => {
        if (typeof newStateOrStateProducer !== 'function') {
            dispatch({
                type: "REPLACE",
                payload: newStateOrStateProducer,
            });
            return;
        }

        const dataOrPromise = (newStateOrStateProducer as Function)(data);

        if (dataOrPromise instanceof Promise) {
            dispatch({
                type: "LOADING",
            });
            dataOrPromise
                .then((data) => {
                    dispatch({
                        type: "REPLACE",
                        payload: data,
                    });
                })
                .catch((error) => {
                    dispatch({
                        type: "FAILED",
                        payload: error,
                    });
                });

            return;
        }
        dispatch({
            type: "REPLACE",
            payload: dataOrPromise,
        });
    }, [data, dispatch]);

    useEffect(() => {
        updateStateAsync(producer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const props = useMemo(() => ({
        reset, error, failed, loading
    }), [reset, error, failed, loading])

    return [data, setState, props];
};
