function checkGamePad(player, gamepad) {
	if (gamepad.axes[1] > 0.5)
		player.left = gamepad.axes[1] * player.speed;
	else if (gamepad.axes[1] < -0.5)
		player.right = gamepad.axes[1] * player.speed;
	else {
		player.left = false;
		player.right = false;
	}
	if (gamepad.axes[0] > 0.5)
		player.up = gamepad.axes[0] * player.speed;
	else if (gamepad.axes[0] < -0.5)
		player.down = gamepad.axes[0] * player.speed;
	else {
		player.up = false;
		player.down = false;
	}
	if (gamepad.buttons[0].pressed)
		player.shoot2 = true;
  else
      player.shoot2 = false;
	if (gamepad.axes[5] === 1)
		player.trigger = true;
  else
    player.trigger = false;
	if (gamepad.buttons[1].pressed)
		player.shoot1 = true;
  else
    player.shoot1 = false;
}

function checkKeys(key, down){
	var speed = players[0].speed;
	switch (key) {
    //player 1 arrow keys
		case 40:
			if (down)
				players[0].left = speed;
			else
				players[0].left = 0;
			break;
		case 38:
			if (down)
				players[0].right = -speed;
			else
				players[0].right = 0;
			break;
		case 39:
			if (down)
				players[0].up = speed;
			else
				players[0].up = 0;
			break;
		case 37:
			if (down)
				players[0].down = -speed;
			else
				players[0].down = 0;
			break;
		case 93:
			if (down)
				players[0].shoot1 = true;
			else
				players[0].shoot1 = false;
			break;
		case 18:
			if (down)
				players[0].shoot2 = true;
			else
				players[0].shoot2 = false;
			break;
      //player 2 WASD
		case 83:
			if (down)
				players[1].left = speed;
			else
				players[1].left = 0;
			break;
		case 87:
			if (down)
				players[1].right = -speed;
			else
				players[1].right = 0;
			break;
		case 70:
			if (down)
				players[1].up = speed;
			else
				players[1].up = 0;
			break;
		case 65:
			if (down)
				players[1].down = -speed;
			else
				players[1].down = 0;
			break;
		case 81:
			if (down)
				players[1].shoot1 = true;
			else
				players[1].shoot1 = false;
			break;
		case 69:
			if (down)
				players[1].shoot2 = true;
			else
				players[1].shoot2 = false;
			break;
      //space to switch
		case 32:
			if (down)
				players[0].trigger = true;
			else
				players[0].trigger = false;
			break;
	}
}
