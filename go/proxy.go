package main

import (
	"bufio"
	"fmt"
	"log"
	"net"
	"sync"
)

type Client struct {
	conn net.Conn
	rep  chan<- string
}

type Command struct {
	client Client
	cmd    string
}

func main() {
	proxy, err := net.Listen("tcp", ":6000")

	if err != nil {
		log.Fatal(err)
	}

	recevie_cmd_chan := make(chan Command)
	addchan := make(chan Client)
	rmchan := make(chan net.Conn)

	go handleClientCmd(recevie_cmd_chan, addchan, rmchan)

	for {
		client, err := proxy.Accept()

		if err != nil {
			log.Println(err)
			continue
		}

		go handleClientConnection(client, recevie_cmd_chan, addchan, rmchan)
	}
}

func handleClientConnection(conn net.Conn, cmdChan chan<- Command, addChan chan<- Client, rmChan chan<- net.Conn) {

	outchan := make(chan string)
	inchan := make(chan string)

	client := Client{conn, outchan}

	addChan <- client

	go func() {
		defer close(inchan)
		defer conn.Close()

		// auth
		reader := bufio.NewReader(conn)

		fmt.Printf("New user has connected system.\n")

		for {
			data, err := reader.ReadString('\n')
			if err != nil {
				break
			}

			inchan <- data
		}

	}()

LOOP:
	for {
		select {
		case data, ok := <-inchan:
			if !ok {
				break LOOP
			}
			cmdChan <- Command{client, data}
		case data, ok := <-outchan:
			if !ok {
				break LOOP
			}
			_, err := conn.Write([]byte(data))

			if err != nil {
				break LOOP
			}
		}
	}

	conn.Close()

	fmt.Printf("Connection from %v closed.", conn.RemoteAddr())

	rmChan <- conn
}

func handleClientCmd(cmdChan <-chan Command, addChan <-chan Client, rmChan <-chan net.Conn) {
	clients := make(map[net.Conn]chan<- string)

	upstream, err := net.Dial("tcp", "127.0.0.1:8001")
	defer upstream.Close()

	if tcpConn, ok := upstream.(*net.TCPConn); ok {
		tcpConn.SetKeepAlive(true)
	}

	if err != nil {
		log.Fatal(err)
		return
	}

	l := new(sync.Mutex)

	for {
		select {
		case cmd, ok := <-cmdChan:
			fmt.Printf("receive cmd: %s", cmd.cmd)

			if !ok {
				return
			}

			go func(cmd Command) {
				l.Lock()

				upstream.Write([]byte(cmd.cmd))
				reader := bufio.NewReader(upstream)
				data, err := reader.ReadString('\n')

				if err != nil {
					return
				}

				cmd.client.rep <- data

				l.Unlock()
			}(cmd)

		case client := <-addChan:
			fmt.Printf("New client: %v\n", client.conn)
			clients[client.conn] = client.rep

		case conn := <-rmChan:
			fmt.Printf("Client disconnnects: %v \n", conn)
			delete(clients, conn)
		}
	}
}
