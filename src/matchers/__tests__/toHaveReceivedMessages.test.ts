/**
 * @copyright Romain Bertrand 2018
 * @copyright Akiomi Kamakura 2023
 */

import '../../extend-expect';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import WS from '../../websocket';

let server: WS, client: WebSocket;
beforeEach(async () => {
  server = new WS('ws://localhost:1234');
  client = new WebSocket('ws://localhost:1234');
  await server.connected;
});

afterEach(() => {
  WS.clean();
});

describe('.toHaveReceivedMessages', () => {
  it('passes when the websocket server received the expected messages', async () => {
    client.send('hello there');
    client.send('how are you?');
    client.send('good?');
    await server.nextMessage;
    await server.nextMessage;
    await server.nextMessage;
    expect(server).toHaveReceivedMessages(['hello there', 'good?']);
  });

  it('passes when the websocket server received the expected JSON messages', async () => {
    const jsonServer = new WS('ws://localhost:9876', { jsonProtocol: true });
    const jsonClient = new WebSocket('ws://localhost:9876');
    await jsonServer.connected;
    jsonClient.send(`{"type":"GREETING","payload":"hello there"}`);
    jsonClient.send(`{"type":"GREETING","payload":"how are you?"}`);
    jsonClient.send(`{"type":"GREETING","payload":"good?"}`);
    await jsonServer.nextMessage;
    await jsonServer.nextMessage;
    await jsonServer.nextMessage;
    expect(jsonServer).toHaveReceivedMessages([
      { type: 'GREETING', payload: 'good?' },
      { type: 'GREETING', payload: 'hello there' },
    ]);
  });

  // TODO: Fix Array indentation
  it('fails when the websocket server did not receive the expected messages', async () => {
    client.send('hello there');
    client.send('how are you?');
    client.send('good?');
    await server.nextMessage;
    await server.nextMessage;
    await server.nextMessage;
    expect(() => {
      expect(server).toHaveReceivedMessages(['hello there', "'sup?"]);
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: [2mexpect([22m[31mWS[39m[2m).toHaveReceivedMessages([22m[32mexpected[39m[2m)[22m

      Expected the WS server to have received the following messages:
        [32mArray [
        "hello there",
        "'sup?",
      ][39m
      Received:
        [31mArray [
        "hello there",
        "how are you?",
        "good?",
      ][39m

      ]
    `);
  });

  it('fails when called with an expected argument that is not a valid WS', async () => {
    expect(() => {
      expect('boom').toHaveReceivedMessages(['hello there']);
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: [2mexpect([22m[31mWS[39m[2m).toHaveReceivedMessages([22m[32mexpected[39m[2m)[22m

      Expected the websocket object to be a valid WS mock.
      Received: string
        [31m"boom"[39m]
    `);
  });
});

describe('.not.toHaveReceivedMessages', () => {
  it('passes when the websocket server received none of the specified messages', async () => {
    client.send('hello there');
    client.send('how are you?');
    client.send('good?');
    await server.nextMessage;
    await server.nextMessage;
    await server.nextMessage;
    expect(server).not.toHaveReceivedMessages(["'sup?", 'U good?']);
  });

  it('fails when the websocket server received at least one unexpected message', async () => {
    client.send('hello there');
    client.send('how are you?');
    client.send('good?');
    await server.nextMessage;
    await server.nextMessage;
    await server.nextMessage;
    expect(() => {
      expect(server).not.toHaveReceivedMessages(["'sup?", 'U good?', 'hello there']);
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: [2mexpect([22m[31mWS[39m[2m).not.toHaveReceivedMessages([22m[32mexpected[39m[2m)[22m

      Expected the WS server to not have received the following messages:
        [32mArray [
        "'sup?",
        "U good?",
        "hello there",
      ][39m
      But it received:
        [31mArray [
        "hello there",
        "how are you?",
        "good?",
      ][39m]
    `);
  });

  it('fails when called with an expected argument that is not a valid WS', async () => {
    expect(() => {
      expect('boom').not.toHaveReceivedMessages(['hello there']);
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: [2mexpect([22m[31mWS[39m[2m).not.toHaveReceivedMessages([22m[32mexpected[39m[2m)[22m

      Expected the websocket object to be a valid WS mock.
      Received: string
        [31m"boom"[39m]
    `);
  });
});
