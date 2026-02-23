# [openjazz.github.io][play]

Play Jazz Jackrabbit in your browser!

## OpenJazz

The main repository for OpenJazz is [here][repo]

## Data files

The data files are the released shareware versions by Epic Megagames:
 - Jazz Jackrabbit Shareware 1.1
 - Holiday Hare
 - Holiday Hare '95

See [shareware-license.txt][license] for conditions.

The shareware archives can be found on [dosgamesarchive].

### How to package the data files

```shell
$ emscripten/tools/file_packager \
    <datafile>.data \
    --preload <directory>@data \
    --js-output=<script>.js
```

[play]: https://openjazz.github.io
[repo]: https://github.com/AlisterT/OpenJazz
[license]: shareware-license.txt
[dosgamesarchive]: https://www.dosgamesarchive.com/related-games/jazz-jackrabbit
