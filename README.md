3D吃豆子游戏。
使用three.js。

这个并不是原版游戏，原版的项目地址在http://www.numb3r23.net/2013/05/21/webgl-paccer-more-three-js/。
但是原版问题非常大，地图小还卡到爆，FPS非常低。如果重玩关卡或选择其他关卡，CPU和GPU占用的资源没有释放，会导致游戏越来越卡，最后浏览器会崩掉

我觉得这个游戏本身不错，就是致命缺点太多，无奈我按了F12，把代码全部抽出来，然后花了1天时间修改这些缺陷。FPS就算是一个大地图，FPS照样维持在60。但是资源释放问题还是解决不了，于是乎我只能通过暴力手段来刷新页面，通过cookie保存关卡名字的方法来切换关卡卡。

这个修改后的版本我就用MIT协议了。

你们可以在http://hypnosnova.github.io/WebGL_Pacman/ 玩这个游戏。

Play it at：http://hypnosnova.github.io/WebGL_Pacman/
