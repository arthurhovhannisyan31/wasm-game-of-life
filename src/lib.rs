extern crate js_sys;
extern crate web_sys;

mod utils;
use std::fmt;
use utils::set_panic_hook;
use wasm_bindgen::prelude::*;
use web_sys::console;

pub struct Timer<'a> {
  name: &'a str,
}

impl<'a> Timer<'a> {
  pub fn new(name: &'a str) -> Timer<'a> {
    console::time_with_label(name);
    Timer { name }
  }
}

impl<'a> Drop for Timer<'a> {
  fn drop(&mut self) {
    console::time_end_with_label(self.name);
  }
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Cell {
  Dead = 0,
  Alive = 1,
}

impl Cell {
  fn toggle(&mut self) {
    *self = match *self {
      Cell::Alive => Cell::Dead,
      Cell::Dead => Cell::Alive,
    }
  }
}

#[wasm_bindgen]
pub struct Universe {
  width: u32,
  height: u32,
  cells: Vec<Cell>,
  cells_temp: Vec<Cell>,
}

impl Universe {
  fn get_index(&self, row: u32, column: u32) -> usize {
    (row * self.width + column) as usize
  }

  fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
    let mut count = 0;

    let north = if row == 0 { self.height - 1 } else { row - 1 };
    let south = if row == self.height - 1 { 0 } else { row + 1 };
    let west = if column == 0 {
      self.width - 1
    } else {
      column - 1
    };
    let east = if column == self.width - 1 {
      0
    } else {
      column + 1
    };

    let nw = self.get_index(north, west);
    count += self.cells[nw] as u8;

    let n = self.get_index(north, column);
    count += self.cells[n] as u8;

    let ne = self.get_index(north, east);
    count += self.cells[ne] as u8;

    let w = self.get_index(row, west);
    count += self.cells[w] as u8;

    let e = self.get_index(row, east);
    count += self.cells[e] as u8;

    let sw = self.get_index(south, west);
    count += self.cells[sw] as u8;

    let s = self.get_index(south, column);
    count += self.cells[s] as u8;

    let se = self.get_index(south, east);
    count += self.cells[se] as u8;

    /* works 5.5 faster module division, see git history */

    count
  }
  pub fn get_cells(&self) -> &[Cell] {
    &self.cells
  }
  pub fn set_cells(&mut self, cells: &[(u32, u32)]) {
    for (row, col) in cells.iter().cloned() {
      let idx = self.get_index(row, col);
      self.cells[idx] = Cell::Alive;
    }

    self.cells_temp.copy_from_slice(&self.cells);
  }
}

#[wasm_bindgen]
impl Universe {
  pub fn new(blanc: Option<bool>, size: Option<u32>) -> Universe {
    set_panic_hook();

    let blanc = blanc.unwrap_or(false);
    let size = size.unwrap_or(32);
    let width = size;
    let height = size;
    let rand = js_sys::Math::random;
    let mut count = 0;

    let cells: Vec<Cell> = (0..width * height)
      .map(|_| {
        if blanc {
          return Cell::Dead;
        }

        // if (val % 7) == 1 {
        if (0.2..0.5).contains(&rand()) {
          count += 1;
          Cell::Alive
        } else {
          Cell::Dead
        }
      })
      .collect();

    log!("Initialized a universe: {width} by {height} with {count} live cells");

    Universe {
      width,
      height,
      cells_temp: cells.clone(),
      cells,
    }
  }
  pub fn render(&self) -> String {
    self.to_string()
  }
  pub fn tick(&mut self) {
    // let _t = Timer::new("Universe::tick");

    {
      // let _t = Timer::new("new generation");

      for row in 0..self.height {
        for col in 0..self.width {
          let idx = self.get_index(row, col);
          let cell = self.cells[idx];
          let live_neighbours = self.live_neighbor_count(row, col);

          let next_cell = match (cell, live_neighbours) {
            // Underpopulation: < 2 live neighbours
            (Cell::Alive, x) if x < 2 => Cell::Dead,
            // Survives: [2:3] live neighbours
            (Cell::Alive, 2) | (Cell::Alive, 3) => Cell::Alive,
            // Overpopulation: > 3 live neighbours
            (Cell::Alive, x) if x > 3 => Cell::Dead,
            // Reproduction: cell becomes live with 3 live neighbours
            (Cell::Dead, 3) => Cell::Alive,
            // No changes
            (otherwise, _) => otherwise,
          };

          self.cells_temp[idx] = next_cell;
        }
      }
    }

    // let _t = Timer::new("free old cells");
    self.cells.copy_from_slice(&self.cells_temp);
  }
  pub fn width(&self) -> u32 {
    self.width
  }
  pub fn height(&self) -> u32 {
    self.height
  }
  pub fn cells(&self) -> *const Cell {
    self.cells.as_ptr()
  }
  pub fn toggle_cell(&mut self, col: u32, row: u32) {
    let idx = self.get_index(row, col);

    self.cells[idx].toggle();
    self.cells_temp.copy_from_slice(&self.cells);
  }
  pub fn set_width(&mut self, width: u32) {
    self.width = width;
    self.cells = (0..width * self.height).map(|_i| Cell::Dead).collect();
    self.cells_temp = self.cells.clone();
  }
  pub fn set_height(&mut self, height: u32) {
    self.height = height;
    self.cells = (0..self.width * height).map(|_i| Cell::Dead).collect();
    self.cells_temp = self.cells.clone();
  }
  pub fn set_glider(&mut self, col: u32, row: u32) {
    let glider_shape: Vec<(u32, u32)> = [(0, 1), (1, 2), (2, 0), (2, 1), (2, 2)]
      .iter()
      .map(|(x, y)| ((col + y) % self.width, (row + x) % self.height))
      .collect();

    glider_shape.into_iter().for_each(|(x, y)| {
      let idx = self.get_index(y, x);

      self.cells[idx] = Cell::Alive;
    });
    self.cells_temp.copy_from_slice(&self.cells);
  }
}

impl Default for Universe {
  fn default() -> Self {
    Self::new(None, None)
  }
}

impl fmt::Display for Universe {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    for line in self.cells.as_slice().chunks(self.width as usize) {
      for &cell in line {
        let symbol = if cell == Cell::Dead { '◻' } else { '◼' };
        write!(f, "{symbol}")?;
      }

      writeln!(f).expect("Failed writing message");
    }

    Ok(())
  }
}
