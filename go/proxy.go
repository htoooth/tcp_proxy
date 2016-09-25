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

	cmdchan := make(chan Command)
	addchan := make(chan Client)
	rmchan := make(chan net.Conn)

	go handleCmd(cmdchan, addchan, rmchan)

	for {
		conn, err := proxy.Accept()

		if err != nil {
			log.Println(err)
			continue
		}

		go handleConnection(conn, cmdchan, addchan, rmchan)
	}
}

func handleConnection(conn net.Conn, cmdchan chan<- Command, addchan chan<- Client, rmchan chan<- net.Conn) {

	outchan := make(chan string)
	inchan := make(chan string)

	client := Client{conn, outchan}

	addchan <- client

	go func() {
		defer close(inchan)

		// auth
		reader := bufio.NewReader(conn)

		fmt.Printf("New user has connected system.\n");

		for {
			data , err := reader.ReadString('\n')
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
			cmdchan <- Command{client, data}
		case data ,ok:= <-outchan:
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

	rmchan <- conn
}

func handleCmd(cmdChan <-chan Command, addChan <-chan Client, rmChan <-chan net.Conn) {
	clients := make(map[net.Conn]chan<- string)

	conn, err := net.Dial("tcp", "127.0.0.1:8001")

	if tcpConn,ok := conn.(* net.TCPConn);ok {
		tcpConn.SetKeepAlive(true);
	}

	if(err != nil){
		log.Fatal(err)
		return
	}

	l := new(sync.Mutex)

	if err != nil {
		return
	}

	for {
		select {
		case cmd, ok := <-cmdChan:
			fmt.Printf("receive cmd: %s", cmd.cmd)

			if !ok {
				return
			}

			go func(cmd Command) {
				l.Lock()

				conn.Write([]byte(cmd.cmd))
				reader := bufio.NewReader(conn)
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
