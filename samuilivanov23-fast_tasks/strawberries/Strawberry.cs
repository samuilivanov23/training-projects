using System;
using System.Collections.Generic;
using System.Text;

namespace Strawberries
{
    public class Strawberry
    {
        public Strawberry()
        {
            this.isRotten = false;
            this.dayRotten = -10;
        }

        public bool isRotten;
        public int dayRotten;
    }
}
