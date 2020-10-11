{ pkgs ? import ./nixpkgs.nix { config = {}; overlays = []; } }:

with pkgs;

let
 project_name = "FreeAndFair";

in mkShell {
  buildInputs =
    let
      coreInputs = [
        bazel_3
        bazel-buildtools
        cacert
        coreutils
        gcc
        gitFull
        nix
        python3
        which
      ];

      scalaInputs = [
        openjdk8
      ] ++ lib.optionals stdenv.isDarwin [
        (xcbuild.override { sdkVer = "10.15"; })
      ];

      jsInputs = [
        nodejs
      ];

      reactNativeInputs = [
        cocoapods
      ];
    in
      coreInputs ++ scalaInputs ++ jsInputs ++ reactNativeInputs;

  name = "${project_name}-build-nix-shell";

  shellHook = ''
    echo >&2 "Entered the '${project_name}' nixified development (and bazel execution) environment"
  '';
}
