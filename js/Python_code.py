import numpy as np
from numpy.random import random
import time

def gen_list_of_peel_probabilities(num_peels):
    # Helper function to generate the list of probabilities for quick sampling
    list_probabilities = [0] 
    total = 0
    for j in range(1, num_peels):
        total += jump_distribution(j)
        list_probabilities.append(total)
    return list_probabilities

# load the list of probabilities for quick sampling
with open('probabilities.txt', 'r') as f:
    list_probabilities = []
    for line in f:
        list_probabilities.append(float(line.strip()))

print('Maximum accuracy of sampling',list_probabilities[-1])
print(1-list_probabilities[-1], "% precent of the samples will be incorrectly sampled as", len(list_probabilities))

def log_sum_until(j):
    acc = 0
    for i in range(1, j+1):
        acc += np.log(i)
    return acc

def log_distribution_j(j):
    return np.log(j+1)+np.log(2)+log_sum_until(2*j-2) - log_sum_until(j-1) - log_sum_until(j+1) - j*np.log(4)

def jump_distribution(j):
    return np.exp(log_distribution_j(j))

def sample_jump():
    x = np.random.rand()
    if x > list_probabilities[-1]:
        R = len(list_probabilities)
    else:
        R = binary_search(x, list_probabilities)
    if random() < 0.5:
        R = -R
    return R

def binary_search(number, sorted_list):
    left = 0
    right = len(sorted_list) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if sorted_list[mid] <= number < sorted_list[mid + 1]:
            return mid + 1
        elif sorted_list[mid] > number:
            right = mid - 1
        else:
            left = mid + 1  
    return left

def peel_common(Xd, Xu):
    #we sample peel size from the distribution
    j = sample_jump()
    i = sample_jump()
    if j < 0 and  i < 0:
        # both jumps are negative. no chance of eating the white part
        Xu = Xu   
        Xd = Xd      
        Yu = max(1, -j+i+1)
        Yd = max(1, -i+j+1)  
    elif j < 0 and i > 0:
        # id is negative, iu is positive. If iu is greater than Xu_n, then we can eat the white part
        Xd = Xd
        if i > Xu:
            Xu = -1
        else:
            Xu = Xu - i
        Yd = 1
        Yu = 1 - j
    elif j > 0 and i < 0:
        # id is positive, iu is negative. If id is greater than Xd, then we eat the white part
        if j > Xd:
            Xd = -1
        else:
            Xd = Xd - j
        Xu = Xu
        Yd = 1 - i
        Yu = 1
    elif j > 0 and i > 0:
        # both jumps are positive. We can eat the white top part if j > Xd and the white bottom part if i > Xu.
        if j > Xd:
            Xd = -1
        else:
            Xd = Xd - j
        if i > Xu:
            Xu = -1
        else:
            Xu = Xu - i
        Yd = 1
        Yu = 1
    else:
        raise ValueError("Invalid state")
    return Xd, Xu, Yd, Yu

def peel_bottom_or_top(X, Y, Y_o,p):
    i = sample_jump()
    if i > 0:
        Y_o = Y_o
        if i > X:
            X = -1
            p = 'd' if p == 'u' else 'u'
            Y += 1 #????
        else:
            X = X - i
            Y += 1 
    elif i < 0:
        if -i < Y:
            Y = Y + i
            Y_o = Y_o
            p = 'd' if p == 'u' else 'u'
        else:
            Y = 1
            Y_o = Y_o -i-Y
            p = 'u'
    return X, Y, Y_o, p

def markov_chain_simulation(p, threshold,verbose=False):
    num_peels = 0
    # starting_config

    Xd_n = 0 
    Xu_n = 0
    Yd_n = -1
    Yu_n = -1
    peel = 'c'

    while (Xd_n, Xu_n) != (-1, -1):
        if num_peels > threshold:
            return "Percolation threshold" , Xd_n, Xu_n, Yd_n, Yu_n, num_peels
        num_peels += 1
        if verbose:
            print('Xd_n','Xu_n','Yd_n','Yu_n','p',Xd_n, Xu_n, Yd_n, Yu_n, peel)
        if peel == 'c':
            if random() < p:
                # peel is white
                Xd_n = Xd_n + 1
                Xu_n = Xu_n + 1
                Yd_n = Yd_n -1
                Yu_n = Yu_n -1
                peel = 'c'
            else:
                # peel is black
                Xd_n, Xu_n, Yd_n, Yu_n = peel_common(Xd_n, Xu_n)
                if Xd_n == -1 and Xu_n == -1:
                    return "Finished" , Xd_n, Xu_n, Yd_n, Yu_n, num_peels
                elif Xu_n == -1:
                    peel = 'd'
                else:
                    peel = 'u'
        elif peel == 'u':
            if random() < p:
                # peel is white
                Xd_n = Xd_n 
                Xu_n = Xu_n + 1
                Yd_n = Yd_n
                Yu_n = Yu_n -1 
                if Yu_n == 0 and Yu_n == 0:
                    peel = 'c'
                elif Yu_n == 0:
                    peel = 'd'
                else:
                    peel = 'u'
            else:
                # peel is black
                Xu_n, Yu_n, Xd_n, peel = peel_bottom_or_top(Xu_n, Yu_n, Xd_n, peel)
                peel = 'u'
        elif peel == 'd':
            if random() < p:
                # peel is white
                Xd_n = Xd_n + 1
                Xu_n = Xu_n 
                Yd_n = Yd_n -1 
                Yu_n = Yu_n 
                if Yu_n == 0 and Yu_n == 0:
                    peel = 'c'
                elif Yu_n == 0:
                    peel = 'u'
                else:
                    peel = 'd'
            else:
                # peel is black
                Xd_n, Yd_n, Yu_n, peel = peel_bottom_or_top(Xd_n, Yd_n, Yu_n, peel)
                peel = 'd'
    return "Finished" , Xd_n, Xu_n, Yd_n, Yu_n, num_peels

G_u = {0 : [-1,1]}
G_d = {0 : [-1,1]}

def markov_chain_simulation_with_border_control(p, threshold,verbose=False):
    num_peels = 0
    # starting_config

    Xd_n = 0 
    Xu_n = 0
    Yd_n = -1
    Yu_n = -1
    peel = 'c'

    current_node = 0
    

    while (Xd_n, Xu_n) != (-1, -1):
        if num_peels > threshold:
            return "Percolation threshold" , Xd_n, Xu_n, Yd_n, Yu_n, num_peels
        num_peels += 1
        if verbose:
            print('Xd_n','Xu_n','Yd_n','Yu_n','p',Xd_n, Xu_n, Yd_n, Yu_n, peel)
        if peel == 'c':
            if random() < p:
                # peel is white
                Xd_n = Xd_n + 1
                Xu_n = Xu_n + 1
                Yd_n = Yd_n -1
                Yu_n = Yu_n -1
                peel = 'c' 
                current_node -= 1
            else:
                # peel is black
                Xd_n, Xu_n, Yd_n, Yu_n = peel_common(Xd_n, Xu_n)
                if Xd_n == -1 and Xu_n == -1:
                    return "Finished" , Xd_n, Xu_n, Yd_n, Yu_n, num_peels
                elif Xu_n == -1:
                    peel = 'd'
                else:
                    peel = 'u'
        elif peel == 'u':
            if random() < p:
                # peel is white
                Xd_n = Xd_n 
                Xu_n = Xu_n + 1
                Yd_n = Yd_n
                Yu_n = Yu_n -1 
                if Yu_n == 0 and Yu_n == 0:
                    peel = 'c'
                elif Yu_n == 0:
                    peel = 'd'
                else:
                    peel = 'u'
            else:
                # peel is black
                Xu_n, Yu_n, Xd_n, peel = peel_bottom_or_top(Xu_n, Yu_n, Xd_n, peel)
                peel = 'u'
        elif peel == 'd':
            if random() < p:
                # peel is white
                Xd_n = Xd_n + 1
                Xu_n = Xu_n 
                Yd_n = Yd_n -1 
                Yu_n = Yu_n 
                if Yu_n == 0 and Yu_n == 0:
                    peel = 'c'
                elif Yu_n == 0:
                    peel = 'u'
                else:
                    peel = 'd'
            else:
                # peel is black
                Xd_n, Yd_n, Yu_n, peel = peel_bottom_or_top(Xd_n, Yd_n, Yu_n, peel)
                peel = 'd'
    return "Finished" , Xd_n, Xu_n, Yd_n, Yu_n, num_peels

def simulate_percolation(p, threshold, num_simulations):
    percolation_contained = 0
    percolation_threshold = 0
    average_num_peels = 0
    for i in range(num_simulations):
        if i % (num_simulations//100) == 0:
            progress = i / num_simulations * 100
            print(f"\rProgress: [{('='*int(progress//2)).ljust(50)}] {progress:.1f}%", end='')
        R = markov_chain_simulation(p,threshold,verbose=False)
        if R[0] == "Percolation threshold":
            percolation_threshold += 1
        if R[0] == "Finished":
            percolation_contained += 1
        average_num_peels += R[5]
    print()
    print("--------------------------------")
    print("Number of simulations",num_simulations)
    print("Percolation threshold",threshold)
    print("--------------------------------")
    print("for the percolation probability",p)
    print("percolation contained precentage",percolation_contained/num_simulations)
    print("percolation threshold reached percentage",percolation_threshold/num_simulations)
    print("average number of peels",average_num_peels/num_simulations)
    print("--------------------------------")


print("Hello World")

start_time = time.time()
num_simulations = 100
threshold = 1000000
for p in [0.25,0.5,0.75,0.9,0.95,0.975,0.99,1]:
    #R = markov_chain_simulation(p,threshold,verbose=True)
    #print(p,R)
    simulate_percolation(p,threshold,num_simulations)
end_time = time.time()
print(f"Time taken: {end_time - start_time:.2f} seconds")

