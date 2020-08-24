using System;
using System.Linq;
using System.Collections.Generic;

namespace Strawberries
{
    class Program
    {
        static void Main(string[] args)
        {

            List<int> inputParams = new List<int>(); ;
            int y;
            int x;
            int days;

            do
            {
                inputParams = Console.ReadLine().Split(" ").Select(int.Parse).ToList();
                y = inputParams[0];
                x = inputParams[1];
                days = inputParams[2];
            }
            while ((y <= 0 || y > 1000) || (x <= 0 || x > 1000) || (days <= 0 || days > 100));
            
            int[] rottenY = new int[2];
            int[] rottenX = new int[2];

            for (int i = 0; i < 2; i++)
            {
                inputParams = Console.ReadLine().Split(" ").Select(int.Parse).ToList();
                rottenY[i] = inputParams[0];
                rottenX[i] = inputParams[1];
            }

            Strawberry[,] strawberries_obj = new Strawberry[x, y];

            for (int i = 0; i < y; i++)
            {
                for (int j = 0; j < x; j++)
                {
                    strawberries_obj[j, i] = new Strawberry();
                }
            }

            string[,] strawberries = new string[x, y];

            for (int i = 0; i < y; i++)
            {
                for(int j = 0; j < x; j++)
                {
                    if((j == rottenX[0] - 1 && i == y - rottenY[0]) || (j == rottenX[1] - 1 && i == y - rottenY[1]))
                    {
                        strawberries[j, i] = "#";
                        strawberries_obj[j, i].isRotten = true;
                    }
                    else
                    {
                        strawberries[j, i] = "$";
                    }
                }
            }

            for(int d = 1; d <= days; d++)
            {
                for (int i = 0; i < y; i++)
                {
                    for (int j = 0; j < x; j++)
                    {
                        if (strawberries_obj[j, i].isRotten)
                        {
                            if (j - 1 >= 0)
                            {
                                if (strawberries_obj[j - 1, i].isRotten == false && strawberries_obj[j, i].dayRotten != d)
                                {
                                    strawberries[j - 1, i] = d.ToString();
                                    strawberries_obj[j - 1, i].dayRotten = d;
                                    strawberries_obj[j - 1, i].isRotten = true;
                                }
                            }

                            if (i - 1 >= 0)
                            {
                                if (strawberries_obj[j, i - 1].isRotten == false && strawberries_obj[j, i].dayRotten != d)
                                {
                                    strawberries[j, i - 1] = d.ToString();
                                    strawberries_obj[j, i - 1].dayRotten = d;
                                    strawberries_obj[j, i - 1].isRotten = true;
                                }
                            }

                            if (j + 1 < x)
                            {
                                if (strawberries_obj[j + 1, i].isRotten == false && strawberries_obj[j, i].dayRotten != d)
                                {
                                    strawberries[j + 1, i] = d.ToString();
                                    strawberries_obj[j + 1, i].dayRotten = d;
                                    strawberries_obj[j + 1, i].isRotten = true;
                                }
                            }

                            if (i + 1 < y)
                            {
                                if (strawberries_obj[j, i + 1].isRotten == false && strawberries_obj[j, i].dayRotten != d)
                                {
                                    strawberries[j, i + 1] = d.ToString();
                                    strawberries_obj[j, i + 1].dayRotten = d;
                                    strawberries_obj[j, i + 1].isRotten = true;
                                }
                            }
                        }
                    }
                }
            }

            int goodCount = 0;
            for (int i = 0; i < y; i++)
            {
                for (int j = 0; j < x; j++)
                {
                    if(strawberries_obj[j, i].isRotten == false)
                    {
                        goodCount++;
                    }
                }
            }
            Console.WriteLine(goodCount);

            //visualizing the state of the strawberries
            for (int i = 0; i < y; i++)
            {
                for (int j = 0; j < x; j++)
                {
                    Console.Write(strawberries[j, i]);
                }
                Console.WriteLine();
            }
        }
    }
}
