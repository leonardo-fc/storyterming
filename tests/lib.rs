use std::{fs, io, panic, path::Path};

use const_format::formatcp;
use storyterming::gen_snapshot_path;

// Let's see if "echo hello world" prints "hello world"

const HELLO_WORLD: &str = "hello world";
const COMMAND: &str = formatcp!("echo {HELLO_WORLD}");
const EXPECTED: &str = formatcp!("{COMMAND}\n{HELLO_WORLD}\n");

fn run_lib<P: AsRef<Path>>(path: P) {
    let assert = storyterming::Command::new(COMMAND).run();

    assert.success().plain_output(HELLO_WORLD).snapshot(path);
}

//

#[test]
fn snapshot_passed() {
    let snapshot_path = &gen_snapshot_path!(snapshot_passed, dir = "temp");
    write_all(snapshot_path, EXPECTED).expect("can't create mock snapshot file");

    run_lib(snapshot_path);

    let snap = fs::read_to_string(snapshot_path).expect("mock snapshot file disappeared");
    assert_eq!(snap, EXPECTED);
}

#[test]
#[should_panic(expected = "Test failed")]
fn missing_snapshot() {
    let snapshot_path = &gen_snapshot_path!(missing_snapshot, dir = "temp");
    let _ = fs::remove_file(snapshot_path);

    let result = panic::catch_unwind(|| {
        run_lib(snapshot_path);
    });

    let new_snapshot_path = snapshot_path.with_extension("new");
    let snap = fs::read_to_string(new_snapshot_path).expect("new snapshot file not created");
    assert_eq!(snap, EXPECTED);

    if let Err(err) = result {
        panic::resume_unwind(err);
    }
}

#[test]
#[should_panic(expected = "Test failed")]
fn snapshot_do_not_match() {
    let snapshot_path = &gen_snapshot_path!(snapshot_do_not_match, dir = "temp");
    write_all(snapshot_path, "echo hell\nhell").expect("can't create mock snapshot file");

    let result = panic::catch_unwind(|| {
        run_lib(snapshot_path);
    });

    let new_snapshot_path = snapshot_path.with_extension("new");
    let snap = fs::read_to_string(new_snapshot_path).expect("new snapshot file not created");
    assert_eq!(snap, EXPECTED);

    if let Err(err) = result {
        panic::resume_unwind(err);
    }
}

/// Write into file and create all of its parent directories if they are missing.
fn write_all<P: AsRef<Path>>(path: P, contents: &str) -> io::Result<()> {
    {
        let path_buf = path.as_ref().to_path_buf();
        if let Some(dir_path) = path_buf.parent() {
            fs::create_dir_all(dir_path)?;
        }
    }

    fs::write(path, contents)
}
