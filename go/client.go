package main

import (
	"bufio"
	"fmt"
	"net"
	"os"
)

func main() {
	conn, err := net.Dial("tcp", "127.0.0.1:6000")

	if err != nil {
		return
	}

	input := bufio.NewReader(os.Stdin)
	server := bufio.NewReader(conn)

	for {
		fmt.Print("[user]>>>")
		text, _ := input.ReadString('\n')
		fmt.Fprint(conn, text)
		message, _ := server.ReadString('\n')
		fmt.Print("Message from server:" + message)
	}
}
