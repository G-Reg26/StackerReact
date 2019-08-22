import ReactDOM from 'react-dom'
import React from 'react';
import './App.css';

function Block(props) {
    const {width, height, x, y} = props;

    return (<rect width={width} height={height} x={x} y={y} className="rect"/>);
}

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            board: [
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
            ],
            gameOver: false,
            winner: false,
            blink: true,
            displayMessage: 'STACKER',
        };

        this.cellScale = 50;
        this.distance = this.cellScale;

        this.update = this.update.bind(this);
        this.handleTouch = this.handleTouch.bind(this);
        this.messageBlink = this.messageBlink.bind(this);
    }

    /**
     * Initializes values when component mounts
     */
    componentDidMount() {
        this.height = this.cellScale * this.state.board.length;
        this.width = this.cellScale * this.state.board[0].length;

        this.intervalId = setInterval(this.update, 150);
        this.setState({
            yPos: this.height - this.cellScale,
            inactiveBlocks: Array(0),
            blocksToSpawn: 3,
        }, () => this.createNewBlocks());

        document.addEventListener("keydown", (evt => this.handleKeyDown(evt)));
    }

    /**
     * When component unmounts
     */
    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    /**
     * Handles key presses
     *
     * @param event used to access which key has been pressed
     */
    handleKeyDown = event => {
        // IF SPACE key is pressed and game is not over
        if (event.key === ' ' && !this.state.gameOver) {
            this.layDownBlock();
        }
        // IF R key is pressed and game is over
        else if (event.key === 'r' && this.state.gameOver) {
            this.reset();
        }
    };

    /**
     * Handles touch presses
     *
     * @returns {Promise<void>}
     */
    handleTouch = async () => {
        if (!this.state.gameOver) {
            await this.layDownBlock();
        } else {
            this.reset();
        }
    };

    /**
     * Checks board to lay block down, checks to see if timer should be sped up, and adds new blocks
     * 
     * @returns {Promise<void>}
     */
    async layDownBlock() {
        await this.checkBoard();

        // IF the game is not over (game state may have changed in checkBoard)
        if (!this.state.gameOver) {
            // IF y position has reached 2/3 of the board
            if (this.state.yPos / this.cellScale === Math.floor(((this.state.board.length - 1)) / 3)) {
                this.newTimer(2, 85);   // INCREASE speed
            }
            // IF y position has reached 1/3 of the board
            else if (this.state.yPos / this.cellScale === Math.floor((2 * (this.state.board.length - 1)) / 3)) {
                this.newTimer(3, 100);  // INCREASE speed
            }

            this.createNewBlocks();
        }
    }

    /**
     * Checks below active blocks
     *  IF there are no blocks below active blocks:
     *      DECREMENT blocks to spawn
     *      IF blocks to spawn equals 0
     *          GAME IS OVER
     *  ELSE:
     *      UPDATE BOARD
     */
    async checkBoard() {
        console.log(this.state.yPos);
        let board = this.state.board.slice();

        // FOREACH active block
        for (let i = 0; i < this.state.activeBlocks.length; i++) {
            const x = this.state.activeBlocks[i].props.x;
            const y = this.state.activeBlocks[i].props.y;

            // IF current y position is at the bottom of the board
            if (this.state.yPos === this.height - this.cellScale) {
                board[y / this.cellScale][x / this.cellScale] = 1;
            } else {
                // IF active block is under a block
                if (board[(y / this.cellScale) + 1][x / this.cellScale] === 1) {
                    board[y / this.cellScale][x / this.cellScale] = 1;
                } else {
                    this.state.activeBlocks.splice(i, 1);   // REMOVE block from active blocks
                    await this.setState({
                        blocksToSpawn: this.state.blocksToSpawn - 1,  // DECREMENT blocks to spawn
                    }, function () {
                        this.setState({
                            gameOver: this.state.blocksToSpawn === 0  // IF blocks to spawn is 0, the game is over
                                                                      // player lost
                        });
                    });

                    i--;
                }
            }
        }

        await this.setState({
            yPos: this.state.yPos - this.cellScale, // SET new y position
            board: board,
            inactiveBlocks:
                this.state.inactiveBlocks.concat(this.state.activeBlocks)   // INSERT active blocks to inactive blocks
        }, function () {
            // IF y position is less than 0 and game is not over
            if (this.state.yPos < 0 && !this.state.gameOver) {
                this.setState({
                    gameOver: true, // game is over
                    winner: true    // player won
                });
            }
        });

        this.distance = this.cellScale;
        console.log(this.state.yPos);
    }

    /**
     * SETS new update interval
     *
     * @param blocksToSpawn value that will be compared to the current value of blocks to spawn
     * @param timeout new timeout value
     */
    newTimer(blocksToSpawn, timeout) {
        // IF current blocks to spawn is equal to blocks to spawn
        if (this.state.blocksToSpawn === blocksToSpawn) {
            this.setState({
                blocksToSpawn: this.state.blocksToSpawn - 1 // DECREMENT blocks to spawn
            });
        }

        // SET new interval
        clearInterval(this.intervalId);

        this.intervalId = setInterval(this.update, timeout);
    }

    /**
     * RESET game to initial state
     */
    reset() {
        // SET new interval
        clearInterval(this.intervalId);

        this.intervalId = setInterval(this.update, 150);

        // RESET state to initial state
        this.setState({
            board: [
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0],
            ],
            gameOver: false,
            winner: false,
            blink: true,
            displayMessage: 'STACKER',
            yPos: this.height - this.cellScale,
            inactiveBlocks: Array(0),
            blocksToSpawn: 3,
        }, () => this.createNewBlocks());
    }

    /**
     * Create new block
     *
     * @param x x position of block
     * @param y y position ob block
     * @returns {*} new block element
     */
    createBlock(x, y) {
        return (
            <Block
                width={this.cellScale}
                height={this.cellScale}
                x={x}
                y={y}
            />
        );
    }

    /**
     * Creates a new set of block elements
     */
    createNewBlocks() {
        const midPoint = Math.floor((this.width / 2) / this.cellScale) * this.cellScale;
        let activeBlocks = Array(0);

        // depending on the amount of blocks to spawn, push n blocks to active blocks
        // eslint-disable-next-line
        switch (this.state.blocksToSpawn) {
            case 3:
                activeBlocks.push(this.createBlock(midPoint - this.cellScale, this.state.yPos));
            // eslint-disable-next-line
            case 2:
                activeBlocks.push(this.createBlock(midPoint, this.state.yPos));
            // eslint-disable-next-line
            case 1:
                activeBlocks.push(this.createBlock(midPoint + this.cellScale, this.state.yPos));
                break;
        }

        this.setState({
            activeBlocks: activeBlocks
        });
    }

    /**
     * Updates active blocks
     */
    update() {
        // IF the game is over and display message is still 'STACKER'
        if (this.state.gameOver && this.state.displayMessage === 'STACKER') {
            // SET new interval
            clearInterval(this.intervalId);
            this.intervalId = setInterval(this.messageBlink, 250);

            this.setState({
                blocks: this.state.activeBlocks.concat(this.state.inactiveBlocks)
            });
        } else {
            this.updateActiveBlocks();

            this.setState({
                blocks: this.state.activeBlocks.concat(this.state.inactiveBlocks)
            });
        }

        this.renderBlocks();
    }

    /**
     * Blinking effect for display message once game is over
     */
    messageBlink() {
        if (this.state.blink) {
            this.setState({
                blink: false,
                displayMessage: this.state.winner ? 'WINNER' : 'LOSER'
            });
        } else {
            this.setState({
                blink: true,
                displayMessage: <span>&nbsp;&nbsp;</span>
            });
        }
    }

    /**
     * Move active blocks
     */
    updateActiveBlocks() {
        const activeBlocks = this.state.activeBlocks.slice();

        // IF rightmost block is at the rightmost cell
        if (activeBlocks[activeBlocks.length - 1].props.x === this.width - this.cellScale) {
            this.distance = -this.cellScale;
        }
        // IF leftmost block is at the leftmost cell
        else if (activeBlocks[0].props.x === 0) {
            this.distance = this.cellScale;
        }

        // move active blocks
        for (let i = 0; i < activeBlocks.length; i++) {
            let y = activeBlocks[i].props.y;
            let x = activeBlocks[i].props.x + this.distance;

            activeBlocks[i] = this.createBlock(x, y);
        }

        this.setState({
            activeBlocks: activeBlocks
        });
    }

    /**
     * Renders all block elements
     */
    renderBlocks() {
        ReactDOM.render(this.state.blocks, document.getElementById('canvas'));
    }

    render() {
        return (
            <div className="root">
                <h1>{this.state.displayMessage}</h1>
                <svg
                    width={this.width}
                    height={this.height}
                    id='canvas'
                    className="canvas"
                    onKeyDown={this.handleKeyDown}
                    onClick={this.handleTouch}
                >
                </svg>
                <h2>{this.state.gameOver ? "PRESS 'R' TO PLAY AGAIN" : "PRESS 'SPACE' TO SET BLOCKS"}</h2>
            </div>
        );
    }
}

export default App;
