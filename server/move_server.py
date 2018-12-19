#!/usr/bin/env python

import asyncio
import websockets
import json

from pymouse import PyMouse

m = PyMouse()


async def counter(websocket, path):
    try:
        begin_position = (0, 0)

        async for message in websocket:
            data = json.loads(message)
            if data['action'] == 'left_click':
                print('left_click')
                pos = m.position()
                m.click(pos[0], pos[1])
            elif data['action'] == 'right_click':
                print('right_click')
                pos = m.position()
                m.click(pos[0], pos[1], 2)
            elif data['action'] == 'mousemove':
                pos = m.position()
                m.move(pos[0] + 2 * data['x'], pos[1] + 2 * data['y'])
            elif data['action'] == 'scroll':
                m.scroll(data['x'], data['y'])
            elif data['action'] == 'dragmove':
                print('drag')
                pos = m.position()
                m.drag(pos[0] + data['x'] * 2, pos[1] + data['y'] * 2)
            elif data['action'] == 'dragstart':
                print('press')
                pos = m.position()
                m.press(pos[0], pos[1], 1)
            elif data['action'] == 'dragend':
                print('release')
                pos = m.position()
                m.release(pos[0], pos[1], 1)

    finally:
        print('exit')


start_server = websockets.serve(counter, '0.0.0.0', 5678)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
