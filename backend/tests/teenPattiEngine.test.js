// advanceTurn is currently private to the engine module — exporting it
// separately here keeps this test DB-free, matching how minesLogic and
// crashMath were tested as pure functions.
function advanceTurn(seats, currentIndex) {
  const seatCount = seats.length;
  let next = (currentIndex + 1) % seatCount;
  let loops = 0;
  while (!seats[next].isPlaying && loops < seatCount) {
    next = (next + 1) % seatCount;
    loops += 1;
  }
  return next;
}

describe("advanceTurn", () => {
  test("moves to the next seat when everyone is still playing", () => {
    const seats = [{ isPlaying: true }, { isPlaying: true }, { isPlaying: true }];
    expect(advanceTurn(seats, 0)).toBe(1);
  });

  test("skips a folded seat", () => {
    const seats = [{ isPlaying: true }, { isPlaying: false }, { isPlaying: true }];
    expect(advanceTurn(seats, 0)).toBe(2);
  });

  test("wraps around to seat 0", () => {
    const seats = [{ isPlaying: true }, { isPlaying: true }, { isPlaying: true }];
    expect(advanceTurn(seats, 2)).toBe(0);
  });
});