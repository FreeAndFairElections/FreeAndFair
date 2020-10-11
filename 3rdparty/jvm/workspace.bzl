load("@rules_jvm_external//:defs.bzl", "maven_install")

# To update the pinned dependencies, use:
# $ ./bazel run @unpinned_thirdparty_jvm//:pin

# TODO(Dave): Would really like a much nicer way of specifying these, which would have the nicer
# effect of also giving me aesthetic aliases for complete bundles in a local BUILD file.  Would
# also really like a way to do automatic version updates / consistent version resolutions across
# the repository
def artifacts():
    return [
    ]

def test_artifacts():
    return [
    ]

def thirdparty_jvm_dependencies():
  pass