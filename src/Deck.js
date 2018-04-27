import React, { Component } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  UIManager
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {
  static defaultProps = {  //if no props is provided,use these default props
    onSwipeRight: () => {},
    onSwipeLeft: () => {}
  }

  constructor(props) {
    super(props);

    const position = new Animated.ValueXY();
    //this object is made to deal with the gestures of touching,dragging etc
    const panResponder = PanResponder.create({
        //this func is executed any tym user taps on the screen,if we return true then this simply means that we want our panResponder to handle the gestures,otherwise not
      onStartShouldSetPanResponder: () => true,
      //callback func which is called every tym user drags his finger on screen
      //here event contains info that what element is touched or pressed etc
     //gesture is what the user is doing with his finger on the screen,contains info that what pixel values user is pressing on
      onPanResponderMove: (event, gesture) => {
           //here dx and dy represents how much the user finger moves in x and y direc. during 1 gesture
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      //whenevr user drags his finger on any element on screen and then releases it ,then this func gets called
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe('left');
        } else {
          this.resetPosition();
        }
      }
    });

    this.state = { panResponder, position, index: 0 };//here index is the index of the current card ie. the card we are applying animation on,every time we complete swiping of a card we update it or increment it to next card
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({ index: 0 });
    }
  }

  componentWillUpdate() {
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring(); //little smooth animation whenever we swipe a card and other card just popup

  }

  forceSwipe(direction) {   //we want the card to move out of the screen
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(this.state.position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(() => this.onSwipeComplete(direction)); //now what we want is that when the swipe duration is complete, we want to apply animations on another card,this callback is called after swipe duration is complete

  }

  onSwipeComplete(direction) {
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    const item = data[this.state.index];

    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    this.state.position.setValue({ x: 0, y: 0 }); //after swiping the card we must have to update the position again to 0,0 so that new card can come at this one

    this.setState({ index: this.state.index + 1 }); //updating the state of index ie. considering the next card for animation
  }

  resetPosition() {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0 }
    }).start();
  }

  getCardStyle() {

    //here this.state.position.x is how much we move our finger in the x-direction
    //basically we are interpolating the dis. we move in x-direc. to the rotation we want
    //here we are saying that for -500 unit o translation we want -120 deg of rotation,for 0 we want 0 and for 500 we waant 120
    //thus we are making a linear realtionship between dx and rotation

    const { position } = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg']
    });

    return {
      ...position.getLayout(),  //we are taking all the properties of this object and using it to form an other object also having transform pty
      transform: [{ rotate }]   //rotating the card as the position of the card changes

    };
  }

  renderCards() {
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }

    return this.props.data.map((item, i) => {  //here i is the index of card in array
      if (i < this.state.index) { return null; }  //it means we have swiped the card already , so now we don't want to display it any more

      if (i === this.state.index) {
        return (
          <Animated.View
            key={item.id}
            style={[this.getCardStyle(), styles.cardStyle, { zIndex: 99 }]}
            {...this.state.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      }

      return (
          //animated view work same as View with additional functionality, here we are using it to avoid flash on images
          //using the top pty we are making our user aware that there are more cards and hence we can swipe
        <Animated.View
          key={item.id}
          style={[styles.cardStyle, { top: 10 * (i - this.state.index), zIndex: 5 }]}
        >
          {this.props.renderCard(item)}
        </Animated.View>
      );
    }).reverse();  //since we want the card 1 on top of the stack ie. want the reverse order
  }

  render() {
    return (
      <View>
        {this.renderCards()}
      </View>
    );
  }
}

const styles = {
  cardStyle: {
    position: 'absolute',  //to stack up the cards on top of each other
    width: SCREEN_WIDTH
  }
};

export default Deck;