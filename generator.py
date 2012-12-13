from vendors.pyCartoDb.cartodb import Cartodb
import random
from vendors.pyCartoDb.cartodb_object import CartoDb_object

cartoPy = Cartodb('xabel')
all_table = cartoPy.at('lotr').open()
class Character:
  def __init__(self, options):
    self.name = options['name']
    self.setted_lon = options['lon']
    self.setted_lat = options['lat']
    self.curr_lon = self.setted_lon
    self.curr_lat = self.setted_lat
    self.head_lon = self.setted_lon
    self.head_lat = self.setted_lat
    self.heading_change = 1
    self.speed = [0, 0]
    self.db_object = CartoDb_object(cartoPy)
  def change_heading(self, options):
    self.heading_change = options['round']
    self.head_lon = options['coordinates']['lon']
    self.head_lat = options['coordinates']['lat']
  def step(self, current_round):
    speed_x = (self.head_lon - self.curr_lon) / (self.heading_change - current_round)
    speed_y = (self.head_lat - self.curr_lat) / (self.heading_change - current_round)
    self.speed = [speed_x, speed_y]
    self.curr_lat = self.curr_lat + speed_y
    self.curr_lon = self.curr_lon + speed_x
  def get_pos(self):
    return [self.curr_lon, self.curr_lat]
  def save(self, round):
    self.db_object.set('character',self.name)
    self.db_object.set('the_geom', '{"type":"Point", "coordinates": ['+str(self.curr_lon)+','+str(self.curr_lat)+']}');
    self.db_object.set('round',round)
    # self.db_object.set('date', str_date)
    self.db_object.save()
    return True

class History:
  current_round = 0
  simulate = False
  def __init__(self, options):
    self.rounds = options['rounds'];
    self.last_round = options['last_round']
    self.initCharacters()
  def initCharacters(self):
    self.characters = []
    for name in self.rounds[1]:
      char_options = {'name': name, 'lon': self.rounds[1][name]['lon'], 'lat': self.rounds[1][name]['lat']}
      char = Character(char_options)
      self.characters.append(char)
  def get_char_heading(self, char):
    for i in range(self.current_round + 1, self.last_round):
      if i in self.rounds:
        if char.name in self.rounds[i]:
          return {"round": i, "coordinates": self.rounds[i][char.name], "current_round": self.current_round}
    return {"round": self.last_round, "coordinates": self.rounds[0][char.name],  "current_round": self.current_round}
  def proccess_round(self):
    self.current_round = self.current_round + 1
    current_round_positions = []
    for char in self.characters:
      if char.heading_change == self.current_round:
        char.change_heading(self.get_char_heading(char))
      char.step(self.current_round)
      while self.current_position_full(current_round_positions, char.get_pos()):
        if random.randint(0,1) > 0:
          char.curr_lon = char.curr_lon + 0.5
          print current_round_positions
          print char.get_pos()
        else:
          char.curr_lat = char.curr_lat + 0.5
          print current_round_positions
          print char.get_pos()
      current_round_positions.append(char.get_pos())
      if not self.simulate:
        char.save(self.current_round)
  def current_position_full(self, current_positions, new_position):
    for position in current_positions:
      if round(position[0],1) == round(new_position[0],1):
        if round(position[1],1) == round(new_position[1],1):
          return True
    return False
  def run(self, n_rounds):
    for i in range(1, n_rounds):
      self.proccess_round()


