//! Test command output via assertions and view colorful snapshots on the UI.
//!
//! ## Examples
//!
//! ```no_run
//! #[test]
//! fn print_hello_world() {
//!     let assert = storyterming::Command::new("my_bin arg1 arg2").run();
//!
//!     assert.success().plain_output("Hello World");
//!
//!     let path = storyterming::gen_snapshot_path!(print_hello_world);
//!     assert.snapshot(path);
//! }
//! ```
//!
//! Now start the UI server to view the snapshots, with the command:
//! ```sh
//! $ storyterming tests/__snapshots__
//! ```

use std::{
    fs,
    path::{Path, PathBuf},
};

use colored::Colorize;
use portable_pty::{native_pty_system, CommandBuilder, ExitStatus, PtySize};

macro_rules! test_fail {
    ($($arg:tt)*) => {{
        eprintln!("{}\n", format!($($arg)*).red());
        panic!("Test failed");
    }};
}
macro_rules! test_assert {
    ($assert:expr, $($arg:tt)*) => {{
        if !$assert {
            eprintln!($($arg)*);
            panic!("Assert failed");
        }
    }};
}

/// [`portable_pty::CommandBuilder`] customized for testing.
pub struct Command {
    command: String,
    cmd_builder: CommandBuilder,
}

impl Command {
    /// Create a new `Command` with program and args of input.
    ///
    /// # Examples
    ///
    /// ```no_run
    /// let assert = storyterming::Command::new("echo Hi")
    ///     .current_dir(std::env::current_dir()?.join("examples"))
    ///     .env("MODE", "test")
    ///     .run();
    /// # Ok::<(), std::io::Error>(())
    /// ```
    #[must_use]
    pub fn new<S: AsRef<str>>(command: S) -> Self {
        let command = command.as_ref().to_owned();

        let (program, args) = {
            let mut command_split = command.split_whitespace();
            let program = command_split.next().expect("Missing command");
            (program, command_split)
        };
        let mut cmd = CommandBuilder::new(program);
        cmd.args(args);

        Self {
            command,
            cmd_builder: cmd,
        }
    }

    #[must_use]
    pub fn current_dir(mut self, dir: PathBuf) -> Self {
        self.cmd_builder.cwd(dir);
        self
    }

    #[must_use]
    pub fn env(mut self, key: &'static str, value: &'static str) -> Self {
        self.cmd_builder.env(key, value);
        self
    }

    /// Executes the command into a pseudo-terminal, waiting for it to finish and collecting all of its output.
    /// # Panics
    /// If failed to open pseudo-terminal, spawn command or read output.
    #[must_use]
    pub fn run(self) -> CommandAssert {
        let pty = native_pty_system()
            .openpty(PtySize {
                rows: 24,
                cols: 80,
                ..PtySize::default()
            })
            .expect("Failed to open pseudo-terminal");

        let mut child = pty
            .slave
            .spawn_command(self.cmd_builder)
            .expect("Command should be valid");

        let output = {
            let mut reader = pty.master.try_clone_reader().unwrap();

            let mut output = String::new();
            reader
                .read_to_string(&mut output)
                .expect("Command output should be UTF-8 valid");

            output = output.replace("\r\n", "\n");
            output
        };

        CommandAssert {
            snapshot_contents: format!("{}\n{}", &self.command, &output),
            command: self.command,
            exit: child.wait().expect("Failed to wait command"),
            plain_output: plain_text(&output),
            colorful_output: output,
        }
    }
}

fn plain_text(data: &str) -> String {
    String::from_utf8(strip_ansi_escapes::strip(data).unwrap()).unwrap()
}

/// Assert the exit status and output of [`Command`].
///
/// # Examples
///
/// ```no_run
/// let assert = storyterming::Command::new("bin").run();
///
/// assert.success().plain_output("Hello world");
/// ```
pub struct CommandAssert {
    command: String,
    exit: ExitStatus,
    colorful_output: String,
    plain_output: String,
    snapshot_contents: String,
}

impl CommandAssert {
    /// Assert the command succeeded.
    ///
    /// # Examples
    ///
    /// ```no_run
    /// let assert = storyterming::Command::new("bin").run();
    ///
    /// assert.success();
    /// ```
    #[allow(clippy::must_use_candidate)]
    pub fn success(&self) -> &Self {
        self.exit(true)
    }

    /// Assert the command failed.
    ///
    /// # Examples
    ///
    /// ```no_run
    /// let assert = storyterming::Command::new("bin").run();
    ///
    /// assert.failure();
    /// ```
    #[allow(clippy::must_use_candidate)]
    pub fn failure(&self) -> &Self {
        self.exit(false)
    }

    /// Assert the command success or failure passing a bool.
    ///
    /// # Examples
    ///
    /// ```no_run
    /// fn test(succeed: bool) {
    ///     let assert = storyterming::Command::new("bin").run();
    ///
    ///     assert.exit(succeed);
    /// }
    /// ```
    #[allow(clippy::must_use_candidate)]
    pub fn exit(&self, succeed: bool) -> &Self {
        test_assert!(
            self.exit.success() == succeed,
            "\n{command_label} {command}\n{expected_label} {exit_status}\n{output_label}\n{output}",
            command_label = "Command".dimmed(),
            expected_label = "Expected to".dimmed(),
            exit_status = if succeed {
                "succeed but failed"
            } else {
                "fail but succeed"
            },
            output_label = "Output:".dimmed(),
            command = self.command,
            output = self.colorful_output
        );
        self
    }

    #[must_use]
    pub fn get_colorful_output(&self) -> &str {
        &self.colorful_output
    }

    #[must_use]
    pub fn get_plain_output(&self) -> &str {
        &self.plain_output
    }

    fn assert(&self, condition: bool, expected: &str, contains: &str) -> &Self {
        test_assert!(
            condition,
            "\n{command_label} {command}\n{expected_label} {contains}\n{output_label}\n{output}",
            command_label = "Command".dimmed(),
            expected_label = format!("Expected {expected}").dimmed(),
            output_label = "Output:".dimmed(),
            command = self.command,
            output = self.colorful_output
        );
        self
    }

    #[allow(clippy::must_use_candidate)]
    pub fn plain_output(&self, contains: &str) -> &Self {
        self.assert(
            self.plain_output.contains(contains),
            "to contains",
            contains,
        )
    }

    #[allow(clippy::must_use_candidate)]
    pub fn plain_output_not(&self, contains: &str) -> &Self {
        self.assert(
            !self.plain_output.contains(contains),
            "to NOT contains",
            contains,
        )
    }

    #[allow(clippy::must_use_candidate)]
    pub fn colorful_output(&self, contains: &str) -> &Self {
        self.assert(
            self.plain_output.contains(contains),
            "to contains (colorful)",
            contains,
        )
    }

    #[allow(clippy::must_use_candidate)]
    pub fn colorful_output_not(&self, contains: &str) -> &Self {
        self.assert(
            !self.plain_output.contains(contains),
            "to NOT contains (colorful)",
            contains,
        )
    }

    /// In case of mismatch, it save the new output in a `.new` file.
    ///
    /// # Panics
    ///
    /// - If there is no snapshot at the specified path, or if the path points
    ///   to a directory.
    /// - If there are mismatches between current and new snapshots.
    pub fn snapshot<P: AsRef<Path>>(&self, path: P) {
        let path = path.as_ref().to_path_buf();

        let old_snapshot = std::fs::read_to_string(&path);

        match old_snapshot {
            Err(_) => {
                if let Some(dir_path) = path.parent() {
                    fs::create_dir_all(dir_path).expect("Can't create snapshots dir");
                }
                let new_path = self.write_new_snapshot(path);
                test_fail!("Missing snapshot, created new at {new_path:?}");
            }
            Ok(old_snapshot) if (old_snapshot != self.snapshot_contents) => {
                let new_path = self.write_new_snapshot(path);
                test_fail!("Snapshots don't matched, created new at {new_path:?}");
            }
            _ => (),
        }
    }

    fn write_new_snapshot(&self, mut path: PathBuf) -> PathBuf {
        path.set_extension("new");
        fs::write(&path, &self.snapshot_contents).expect("Can't write to snapshot file");
        path
    }
}

/// # Examples
///
/// Inside a file called `lib.rs`.
/// ```
/// use std::path::Path;
/// use storyterming::gen_snapshot_path;
///
/// fn my_test() {
///     let p = gen_snapshot_path!(my_test);
///     assert_eq!(Path::new("tests/__snapshots__/lib/my_test"), p)
/// }
/// # my_test();
///
/// fn my_other_test() {
///     let p = gen_snapshot_path!(my_other_test, dir = ".");
///     assert_eq!(Path::new("./__snapshots__/lib/my_other_test"), p)
/// }
/// # my_other_test();
/// ```
#[macro_export]
macro_rules! gen_snapshot_path {
    ($test_name:ident$(, dir = $dir:literal)?) => {{
        let file = std::path::Path::new(file!())
            .file_stem()
            .unwrap()
            .to_str()
            .unwrap();

        let test = stringify!($test_name);

        let mut path = std::path::PathBuf::new();
        path.push(storyterming::default_path!($($dir)?));
        path.push("__snapshots__");
        path.push(file);
        path.push(stringify!($test_name));
        path
    }};
}

#[macro_export]
macro_rules! default_path {
    () => {
        "tests"
    };
    ($dir:expr) => {
        $dir
    };
}
