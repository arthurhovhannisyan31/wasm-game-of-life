extern crate fixedbitset;
extern crate js_sys;

mod utils;
use fixedbitset::FixedBitSet;
use std::fmt;
use wasm_bindgen::prelude::*;
use web_sys::console::log_1 as log;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Cell {
  Dead = 0,
  Alive = 1,
}

#[wasm_bindgen]
pub struct Universe {
  width: u32,
  height: u32,
  cells: FixedBitSet,
}

impl Universe {
  fn get_index(&self, row: u32, column: u32) -> usize {
    (row * self.width + column) as usize
  }

  fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
    let mut count = 0;
    for delta_row in [self.height - 1, 0, 1].iter().cloned() {
      for delta_col in [self.width - 1, 0, 1].iter().cloned() {
        if delta_row == 0 && delta_col == 0 {
          continue;
        }
        let neighbor_row = (row + delta_row) % self.height;
        let neighbor_col = (column + delta_col) % self.width;
        let idx = self.get_index(neighbor_row, neighbor_col);
        count += self.cells[idx] as u8;
      }
    }

    count
  }
  fn set_value(&self, row: u32, column: u32, value: Cell) {
    // TODO
    unimplemented!("Add cell value set from user click");
  }
}

#[wasm_bindgen]
impl Universe {
  pub fn new() -> Universe {
    let width: u32 = 64;
    let height: u32 = 64;
    let size = (width * height) as usize;
    let rand = js_sys::Math::random;

    // let cross_sign_points: Vec<(usize, usize)> = vec![
    //   (0, 0),
    //   (1, 1),
    //   (2, 2),
    //   (3, 3),
    //   (4, 4),
    //   (5, 5),
    //   (6, 6),
    //   (7, 7),
    //   (7, 0),
    //   (6, 1),
    //   (6, 1),
    //   (5, 2),
    //   (4, 3),
    //   (3, 4),
    //   (2, 5),
    //   (1, 6),
    //   (0, 7),
    // ];

    let mut cells = FixedBitSet::with_capacity(size);

    for i in 0..size {
      cells.set(i, rand() < 0.5);
    }

    // cross_sign_points.iter().cloned().for_each(|(x, y)| {
    //   let idx = y * width as usize + x;
    //
    //   log(&format!("idx: {:#?}", idx).into());
    //
    //   cells.set(idx, true);
    // });

    log(&format!("cells: {:#?}", cells).into());

    Universe {
      width,
      height,
      cells,
    }
  }
  pub fn render(&self) -> String {
    // accept canvas context and do rendering here
    self.to_string()
  }
  pub fn tick(&mut self) {
    let mut next = self.cells.clone();

    for row in 0..self.height {
      for col in 0..self.width {
        let idx = self.get_index(row, col);
        let cell = self.cells[idx];
        let live_neighbours = self.live_neighbor_count(row, col);

        next.set(
          idx,
          match (cell, live_neighbours) {
            // Underpopulation: < 2 live neighbours
            (true, x) if x < 2 => false,
            // Survives: [2:3] live neighbours
            (true, 2) | (true, 3) => true,
            // Overpopulation: > 3 live neighbours
            (true, x) if x > 3 => false,
            // Reproduction: cell becomes live with 3 live neighbours
            (false, 3) => true,
            // No changes
            (otherwise, _) => otherwise,
          },
        );
      }
    }

    self.cells = next;
  }
  pub fn width(&self) -> u32 {
    self.width
  }
  pub fn height(&self) -> u32 {
    self.height
  }
  pub fn cells(&self) -> *const fixedbitset::Block {
    self.cells.as_slice().as_ptr()
  }
}

impl Default for Universe {
  fn default() -> Self {
    Self::new()
  }
}

impl fmt::Display for Universe {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    for line in self.cells.as_slice().chunks(self.width as usize) {
      for &cell in line {
        let symbol = if cell == 0 { '◻' } else { '◼' };
        write!(f, "{}", symbol)?;
      }
      write!(f, "\n");
    }

    Ok(())
  }
}
