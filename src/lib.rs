//! Test command output via assertions and view colorful snapshots on the dashboard.
//!
//! ## Examples
//!
//! ```rust,no_run
//! #[test]
//! fn print_hello_world() {
//!     let assert = storyterming::Command::new("my_bin arg1 arg2").run().unwrap();
//!
//!     assert.success().plain_output("Hello World");
//!
//!     let path = format!("tests/__snapshots__/{}", stringify!(print_hello_world));
//!     assert.snapshot(path);
//! }
//! ```
//!
//! Now start the dashboard server to view the snapshots, with the command:
//! ```sh
//! $ storyterming tests/__snapshots__
//! ```

use std::{
    fs,
    path::{Path, PathBuf},
};

use color_eyre::{eyre::eyre, Result};
use colored::Colorize;
use portable_pty::{native_pty_system, CommandBuilder, ExitStatus, PtySize};

trait ToEyre<T> {
    fn eyre(self) -> color_eyre::Result<T>;
}

impl<T, E: std::fmt::Debug> ToEyre<T> for Result<T, E> {
    fn eyre(self) -> color_eyre::Result<T> {
        self.map_err(|e| eyre!("{e:?}"))
    }
}

macro_rules! my_panic {
    ($($arg:tt)*) => {{
        eprintln!("{}\n", format!($($arg)*).red());
        panic!("Test failed");
    }};
}
macro_rules! my_assert {
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
    ///     .run()?;
    /// # Ok::<(), color_eyre::Report>(())
    /// ```
    pub fn new<S: AsRef<str>>(command: S) -> Self {
        let command = command.as_ref().to_owned();

        let (program, args) = {
            let mut command_split = command.split_whitespace();
            let program = command_split.next().expect("Missing Command");
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

    /// # Errors
    /// * Can't open pty
    /// * Can't spawn command
    pub fn run(self) -> Result<CommandAssert> {
        let pty = native_pty_system()
            .openpty(PtySize {
                rows: 24,
                cols: 80,
                ..PtySize::default()
            })
            .eyre()?;

        let mut child = pty.slave.spawn_command(self.cmd_builder).eyre()?;

        drop(pty.slave);

        let mut reader = pty.master.try_clone_reader().eyre()?;

        let mut output = String::new();
        reader.read_to_string(&mut output)?;

        output = output.replace("\r\n", "\n");

        Ok(CommandAssert {
            snapshot_contents: format!("{}\n{}", &self.command, &output),
            command: self.command,
            exit: child.wait()?,
            plain_output: plain_text(&output),
            colorful_output: output,
        })
    }
}

fn plain_text(data: &String) -> String {
    String::from_utf8(strip_ansi_escapes::strip(data).unwrap()).unwrap()
}

/// Assert the exit status and output of [`Command`].
///
/// # Examples
///
/// ```no_run
/// let assert = storyterming::Command::new("bin").run().unwrap();
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
    /// let assert = storyterming::Command::new("bin").run().unwrap();
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
    /// let assert = storyterming::Command::new("bin").run().unwrap();
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
    ///     let assert = storyterming::Command::new("bin").run().unwrap();
    ///
    ///     assert.exit(succeed);
    /// }
    /// ```
    #[allow(clippy::must_use_candidate)]
    pub fn exit(&self, succeed: bool) -> &Self {
        my_assert!(
            self.exit.success() == succeed,
            "\n{command_label} {command}\n{expected_label} {exit_status}\n{output_label}\n{output}",
            command_label = "Command".dimmed(),
            expected_label = "Expected to".dimmed(),
            exit_status = if succeed {
                "succeed but failed"
            } else {
                "failed but succeed"
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
        my_assert!(
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

    /// In case of mismatch, it save the new output in a `.new` file
    ///
    /// # Panics
    ///
    /// - Panics if there is no snapshot at the specified path, or if the path points
    ///   to a directory.
    /// - Panics if there are mismatches between current and new snapshots.
    pub fn snapshot<P: AsRef<Path>>(&self, path: P) {
        let path = path.as_ref().to_path_buf();

        let old_snapshot = fs::read_to_string(&path);

        match old_snapshot {
            Err(_) => {
                let dir_path = path.parent().unwrap();
                fs::create_dir_all(dir_path).expect("Can't create snapshots dir");

                let new_path = self.write_new_snapshot(path);
                my_panic!("Missing snapshot, created new at {new_path:?}");
            }
            Ok(old_snapshot) if (old_snapshot != self.snapshot_contents) => {
                let new_path = self.write_new_snapshot(path);
                my_panic!("Snapshots don't matched, created new at {new_path:?}");
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
/// ```no_run
/// #[test]
/// fn my_test() {
///     let path = gen_snapshot_path!(my_test);
///     // ...
/// }
/// ```
/// ```no_run
/// #[test]
/// fn my_test() {
///     let path = gen_snapshot_path!(my_test, dir = "..");
///     // ...
/// }
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
        "."
    };
    ($dir:expr) => {
        $dir
    };
}
