import { act, renderHook } from "@testing-library/react-hooks";
import { useStateReducer } from "../useStateReducer";

describe("useStateReducer", () => {
  it("should return undefined as initial state", () => {
    const hook = renderHook(() => useStateReducer());

    expect(hook.result.current[0]).toBe(undefined);
  });

  it("should replace state", () => {
    const hook = renderHook(() => useStateReducer<any>());
    act(() => {
      hook.result.current[1]({ data: "test" });
    });
    expect(hook.result.current[0]).toEqual({ data: "test" });
  });

  it("should produce new state", () => {
    const hook = renderHook(() => useStateReducer<number>(1));
    act(() => {
      hook.result.current[1]((count) => (count || 0) + 1);
    });
    expect(hook.result.current[0]).toEqual(2);
  });

  it("should reset state", () => {
    const hook = renderHook(() => useStateReducer<any>());
    act(() => {
      hook.result.current[1]({ data: "test" });
    });
    expect(hook.result.current[0]).toEqual({ data: "test" });
    act(() => {
      hook.result.current[2].reset();
    });

    expect(hook.result.current[0]).toEqual(undefined);
  });

  it("should produce async state", async () => {
    const hook = renderHook(() =>
      useStateReducer<number>(1, () => Promise.resolve(2))
    );
    expect(hook.result.current[0]).toEqual(1);
    await act(async () => {
      await hook.waitForNextUpdate();
    });
    expect(hook.result.current[0]).toEqual(2);
  });

  it("should produce new state with async setter", async () => {
    const hook = renderHook(() => useStateReducer<number>(1));
    act(() => {
      hook.result.current[1](() => Promise.resolve(2));
    });
    await act(async () => {
      await hook.waitForNextUpdate();
    });
    expect(hook.result.current[0]).toEqual(2);
  });

  it("should produce state after async setter error", async () => {
    const hook = renderHook(() => useStateReducer<number>(1));

    expect(hook.result.current[0]).toEqual(1);

    act(() => {
      hook.result.current[1](() => Promise.reject("Error"));
    });
    await act(async () => {
      await hook.waitForNextUpdate();
    });
    expect(hook.result.current[0]).toEqual(1);
    expect(hook.result.current[2]).toEqual({
      error: "Error",
      failed: true,
      loading: false,
      reset: expect.any(Function),
    });
  });

  it("should produce async state after error", async () => {
    const hook = renderHook(() =>
      useStateReducer<number>(1, () => Promise.reject("Error"))
    );
    expect(hook.result.current[0]).toEqual(1);
    await act(async () => {
      await hook.waitForNextUpdate();
    });
    expect(hook.result.current[0]).toEqual(1);
    expect(hook.result.current[2]).toEqual({
      error: "Error",
      failed: true,
      loading: false,
      reset: expect.any(Function),
    });
  });
});
