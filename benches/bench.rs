// #![feature(test)]
//
// extern crate test;
// extern crate wasm_game_of_life;
//
// #[bench]
// fn universe_ticks(b: &mut test::Bencher) {
//   let mut universe = wasm_game_of_life::Universe::new(None, Some(500));
//
//   b.iter(|| {
//     universe.tick();
//   });
// }
