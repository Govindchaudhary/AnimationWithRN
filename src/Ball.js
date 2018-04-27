import React,{Component} from 'react'
import {View,Animated} from 'react-native'

class Ball extends Component {

    componentWillMount() {
        this.position = new Animated.ValueXY(0,0); //ValueXY() where the item is at any given tym, here we are saying that starting position of the ball is at 0,0
        Animated.spring(this.position,{  // where the ball is moving to, basically we are telling that we want to modify the ball position from its current position to new one over some amt of tym here we are using the default tym =1sec
            toValue:{x:200,y:500}
        }).start();
      }
    render() {
        return(
            //animated.view is used to sepicify the thing we want to animate
            //we place the thing we want to animate inside the tag
            // to specify Animated.view that how we are going to change the item over tym , we are using style prop
            //here getLayout() func contains info to tell the animated.view , how it should be changing
            <Animated.View style={this.position.getLayout()}> 
                <View style={styles.ball}/>
            </Animated.View>
        );
    }
}

const styles = {
    ball:{
        height:60,
        width:60,
        borderRadius:30,
        borderWidth:30,
        borderColor:'black'
    }
};
export default Ball;

